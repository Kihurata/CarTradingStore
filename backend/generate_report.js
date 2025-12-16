const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const ROOT_TEST_DIR = path.join(__dirname, 'tests', 'unit'); // Đường dẫn tới thư mục test
const OUTPUT_FILE = 'Unit_Test_Report.xlsx';

const TARGET_FOLDERS = [
    'controllers',
    'middleware',
    'routes',
    'services',
    'utils'
];

// ==========================================
// 2. CÁC HÀM XỬ LÝ TEXT (PARSER)
// ==========================================
function extractTag(commentBlock, tagName) {
    // Regex tìm nội dung trong thẻ [TagName]: ...
    const regex = new RegExp(`\\[${tagName}\\]:\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = commentBlock.match(regex);
    return match ? match[1].trim() : '';
}

function parseTestFile(filePath, fileName, folderName) {
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const testCases = [];
    
    // Tìm tên Function chính (thường nằm trong describe)
    const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
    const functionName = describeMatch ? describeMatch[1] : fileName.replace('.test.ts', '');

    // Tìm các block comment đi kèm với it()
    // Pattern: /* ...comment... */ it('...')
    const regex = /\/\*([\s\S]*?)\*\/\s*it\s*\(\s*['"`](.*?)['"`]/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const commentBlock = match[1];
        testCases.push({
            folder: folderName.toUpperCase(),
            functionName: functionName,
            description: extractTag(commentBlock, 'Description'),
            preCondition: extractTag(commentBlock, 'Pre-condition'),
            dataTest: extractTag(commentBlock, 'Data Test'),
            steps: extractTag(commentBlock, 'Steps'),
            expectedResult: extractTag(commentBlock, 'Expected Result'),
            actualResult: 'As Expected', // Mặc định
            status: 'Pass'               // Mặc định
        });
    }
    return testCases;
}

// ==========================================
// 3. ĐỊNH NGHĨA STYLES (GIAO DIỆN)
// ==========================================

// Hàm kẻ khung viền mỏng cho ô
const addBorders = (cell) => {
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
};

// [THEME MỚI]: Nền Vàng Kem (#FFFFCC)
const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFCC' } 
};

// [THEME MỚI]: Chữ Đen (cho nổi trên nền vàng)
const headerFont = {
    name: 'Calibri',
    color: { argb: 'FF000000' }, 
    bold: true,
    size: 11
};

// Style cho Hyperlink (Xanh dương, gạch chân)
const linkFont = {
    name: 'Calibri',
    color: { argb: 'FF000000' },
    size: 11
};

// Căn chỉnh
const centerStyle = { vertical: 'middle', horizontal: 'center', wrapText: true };
const leftStyle = { vertical: 'top', horizontal: 'left', wrapText: true };


// ==========================================
// 4. HÀM CHÍNH (MAIN GENERATOR)
// ==========================================
async function generateExcel() {
    console.log('🔄 Đang khởi tạo file Excel...');
    const workbook = new ExcelJS.Workbook();
    
    // ------------------------------------------
    // A. TẠO SHEET DANH SÁCH TỔNG ("Unit Test Case List")
    // ------------------------------------------
    const listSheet = workbook.addWorksheet('Unit Test Case List');

    // Thiết lập độ rộng cột
    listSheet.getColumn('A').width = 5;  // Lề
    listSheet.getColumn('B').width = 8;  // ID
    listSheet.getColumn('C').width = 25; // Function
    listSheet.getColumn('D').width = 15; // Sheet Name
    listSheet.getColumn('E').width = 50; // Description
    listSheet.getColumn('F').width = 40; // Pre-Condition

    // --- Header thông tin dự án ---
    listSheet.mergeCells('B2:C2'); listSheet.getCell('B2').value = 'Project Name';
    listSheet.mergeCells('D2:F2'); listSheet.getCell('D2').value = 'Car Trading Store System';
    
    listSheet.mergeCells('B3:C3'); listSheet.getCell('B3').value = 'Project Code';
    listSheet.mergeCells('D3:F3'); listSheet.getCell('D3').value = 'CTT-2025';

    listSheet.mergeCells('B4:C4'); listSheet.getCell('B4').value = 'Test Environment';
    listSheet.mergeCells('D4:F4'); listSheet.getCell('D4').value = 'Node.js v18+, Jest, PostgreSQL\nEditor: VS Code';
    listSheet.getCell('D4').alignment = { wrapText: true };

    // Định dạng header dự án (đậm)
    ['B2', 'B3', 'B4'].forEach(cell => listSheet.getCell(cell).font = { bold: true });

    // --- Header Bảng Danh Sách ---
    const headerRowIdx = 7;
    const headerValues = ['', 'ID', 'Function', 'Sheet Name', 'Description', 'Pre-Condition'];
    
    // Tô màu và kẻ khung header bảng
    ['B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const cell = listSheet.getCell(`${col}${headerRowIdx}`);
        cell.value = headerValues[index + 1];
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = centerStyle;
        addBorders(cell);
    });

    // --- Duyệt file và điền dữ liệu ---
    let globalId = 1;
    let currentRowIdx = headerRowIdx + 1;
    let allTestCases = [];

    for (const folder of TARGET_FOLDERS) {
        const folderPath = path.join(ROOT_TEST_DIR, folder);
        if (fs.existsSync(folderPath)) {
            
            // Tạo dòng tiêu đề Section (VD: CONTROLLERS)
            const sectionRow = listSheet.getRow(currentRowIdx);
            listSheet.mergeCells(`B${currentRowIdx}:F${currentRowIdx}`);
            const sectionCell = listSheet.getCell(`B${currentRowIdx}`);
            sectionCell.value = folder.toUpperCase();
            sectionCell.font = { bold: true };
            sectionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }; // Xám nhạt
            sectionCell.alignment = { vertical: 'middle', horizontal: 'left' };
            ['B', 'C', 'D', 'E', 'F'].forEach(c => addBorders(listSheet.getCell(`${c}${currentRowIdx}`)));
            
            currentRowIdx++;

            // Đọc các file .ts trong thư mục
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.ts'));
            for (const file of files) {
                const cases = parseTestFile(path.join(folderPath, file), file, folder);
                
                cases.forEach(tc => {
                    const sheetName = `UC${String(globalId).padStart(2, '0')}`; // Tạo tên sheet: UC01, UC02...
                    const row = listSheet.getRow(currentRowIdx);
                    
                    // Gán dữ liệu
                    row.getCell(2).value = globalId;
                    row.getCell(3).value = tc.functionName;
                    
                    // [QUAN TRỌNG]: Tạo Hyperlink tới Sheet chi tiết
                    row.getCell(4).value = {
                        text: sheetName,
                        hyperlink: `#'${sheetName}'!A1`, 
                        tooltip: 'Nhấn để xem chi tiết'
                    };
                    
                    row.getCell(5).value = tc.description;
                    row.getCell(6).value = tc.preCondition;

                    // Định dạng style cho từng ô
                    row.getCell(2).alignment = centerStyle;
                    row.getCell(3).alignment = leftStyle;
                    
                    row.getCell(4).alignment = centerStyle;
                    row.getCell(4).font = linkFont; // Màu xanh link

                    row.getCell(5).alignment = leftStyle;
                    row.getCell(6).alignment = leftStyle;

                    // Kẻ khung
                    ['B', 'C', 'D', 'E', 'F'].forEach(c => addBorders(row.getCell(c)));

                    // Lưu lại để lát tạo sheet chi tiết
                    tc.id = globalId;
                    tc.sheetName = sheetName;
                    allTestCases.push(tc);

                    globalId++;
                    currentRowIdx++;
                });
            }
        }
    }

    // ------------------------------------------
    // B. TẠO CÁC SHEET CHI TIẾT (UC01, UC02...)
    // ------------------------------------------
    console.log(`📝 Đang tạo ${allTestCases.length} sheet chi tiết...`);
    
    allTestCases.forEach(tc => {
        const sheet = workbook.addWorksheet(tc.sheetName);

        // Cấu hình độ rộng cột giống mẫu báo cáo chuẩn
        sheet.getColumn('A').width = 15; 
        sheet.getColumn('B').width = 25; 
        sheet.getColumn('C').width = 15; 
        sheet.getColumn('D').width = 20; 
        sheet.getColumn('E').width = 20; 
        sheet.getColumn('F').width = 20; 
        sheet.getColumn('G').width = 10; 
        sheet.getColumn('H').width = 15; 

        // --- Block Thông tin chung (Info) ---
        sheet.getCell('A1').value = 'Test Case ID'; sheet.getCell('A1').font = { bold: true };
        sheet.mergeCells('B1:C1'); sheet.getCell('B1').value = tc.sheetName;
        
        sheet.getCell('D1').value = 'Test Case Description'; sheet.getCell('D1').font = { bold: true };
        sheet.mergeCells('E1:H1'); sheet.getCell('E1').value = tc.description; sheet.getCell('E1').alignment = { wrapText: true };

        sheet.getCell('A2').value = 'Created By'; sheet.getCell('A2').font = { bold: true };
        sheet.mergeCells('B2:C2'); sheet.getCell('B2').value = 'Tester'; // Tên bạn
        
        sheet.getCell('D2').value = 'Reviewed By'; sheet.getCell('D2').font = { bold: true };
        sheet.mergeCells('E2:F2'); sheet.getCell('E2').value = 'Manager';
        
        sheet.getCell('G2').value = 'Version'; sheet.getCell('G2').font = { bold: true };
        sheet.getCell('H2').value = '1.0';

        sheet.getCell('A4').value = 'Date Tested'; sheet.getCell('A4').font = { bold: true };
        sheet.mergeCells('B4:C4'); sheet.getCell('B4').value = new Date().toISOString().split('T')[0];
        
        sheet.mergeCells('E4:G4'); sheet.getCell('E4').value = 'Test Result'; sheet.getCell('E4').font = { bold: true };
        const statusCell = sheet.getCell('H4');
        statusCell.value = tc.status; // 'Pass'
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Xanh lá nhạt
        statusCell.font = { color: { argb: 'FF006100' } }; // Chữ xanh đậm

        // Kẻ khung cho block Info
        ['A1', 'B1', 'D1', 'E1', 'A2', 'B2', 'D2', 'E2', 'G2', 'H2', 'A4', 'B4', 'E4', 'H4'].forEach(addr => {
             addBorders(sheet.getCell(addr));
        });

        // --- Nút quay lại (Back Link) ---
        sheet.getCell('A10').value = { text: '← Back to List', hyperlink: "#'Unit Test Case List'!A1" };
        sheet.getCell('A10').font = linkFont;

        // --- Block Dữ liệu Test (Data Test) ---
        const dataHeaderRow = 6;
        sheet.getCell(`A${dataHeaderRow}`).value = 'ID';
        sheet.mergeCells(`B${dataHeaderRow}:H${dataHeaderRow}`); sheet.getCell(`B${dataHeaderRow}`).value = 'Data Test';
        
        // Style Header (Theme Vàng Kem)
        sheet.getCell(`A${dataHeaderRow}`).fill = headerFill; sheet.getCell(`A${dataHeaderRow}`).font = headerFont;
        sheet.getCell(`B${dataHeaderRow}`).fill = headerFill; sheet.getCell(`B${dataHeaderRow}`).font = headerFont;
        addBorders(sheet.getCell(`A${dataHeaderRow}`)); addBorders(sheet.getCell(`B${dataHeaderRow}`));

        // Value Data
        const dataValRow = 7;
        sheet.getCell(`A${dataValRow}`).value = '1';
        sheet.mergeCells(`B${dataValRow}:H${dataValRow}`); 
        sheet.getCell(`B${dataValRow}`).value = tc.dataTest;
        sheet.getCell(`B${dataValRow}`).alignment = leftStyle;
        addBorders(sheet.getCell(`A${dataValRow}`)); addBorders(sheet.getCell(`B${dataValRow}`));

        // --- Block Kịch bản (Scenario) ---
        const scenarioRow = 12;
        sheet.mergeCells(`A${scenarioRow}:B${scenarioRow}`); sheet.getCell(`A${scenarioRow}`).value = 'Test Scenario';
        sheet.getCell(`A${scenarioRow}`).font = { bold: true };
        sheet.mergeCells(`C${scenarioRow}:H${scenarioRow}`); sheet.getCell(`C${scenarioRow}`).value = tc.description;
        sheet.getCell(`C${scenarioRow}`).alignment = { wrapText: true };
        addBorders(sheet.getCell(`A${scenarioRow}`)); addBorders(sheet.getCell(`C${scenarioRow}`));

        // --- Block Các bước thực hiện (Steps Table) ---
        const stepHeadRow = 14;
        sheet.getCell(`A${stepHeadRow}`).value = 'Step';
        sheet.mergeCells(`B${stepHeadRow}:D${stepHeadRow}`); sheet.getCell(`B${stepHeadRow}`).value = 'Step Details';
        sheet.mergeCells(`E${stepHeadRow}:F${stepHeadRow}`); sheet.getCell(`E${stepHeadRow}`).value = 'Expected Results';
        sheet.getCell(`G${stepHeadRow}`).value = 'Actual Results';
        sheet.getCell(`H${stepHeadRow}`).value = 'Status';

        // Style Header Steps (Theme Vàng Kem)
        ['A', 'B', 'E', 'G', 'H'].forEach(c => {
            const cell = sheet.getCell(`${c}${stepHeadRow}`);
            cell.fill = headerFill;
            cell.font = headerFont;
            cell.alignment = centerStyle;
            addBorders(cell);
        });

        // Content Steps
        const stepContentRow = 15;
        sheet.getCell(`A${stepContentRow}`).value = '1';
        sheet.getCell(`A${stepContentRow}`).alignment = centerStyle;

        sheet.mergeCells(`B${stepContentRow}:D${stepContentRow}`); 
        sheet.getCell(`B${stepContentRow}`).value = tc.steps;
        sheet.getCell(`B${stepContentRow}`).alignment = leftStyle;

        sheet.mergeCells(`E${stepContentRow}:F${stepContentRow}`); 
        sheet.getCell(`E${stepContentRow}`).value = tc.expectedResult;
        sheet.getCell(`E${stepContentRow}`).alignment = leftStyle;

        sheet.getCell(`G${stepContentRow}`).value = tc.actualResult;
        sheet.getCell(`G${stepContentRow}`).alignment = centerStyle;

        sheet.getCell(`H${stepContentRow}`).value = tc.status;
        sheet.getCell(`H${stepContentRow}`).alignment = centerStyle;

        // Kẻ khung nội dung
        ['A', 'B', 'E', 'G', 'H'].forEach(c => addBorders(sheet.getCell(`${c}${stepContentRow}`)));
    });

    // ------------------------------------------
    // C. LƯU FILE
    // ------------------------------------------
    await workbook.xlsx.writeFile(OUTPUT_FILE);
    console.log(`✅ Đã xuất file thành công: ${OUTPUT_FILE}`);
}

// Chạy hàm chính
generateExcel().catch(err => console.error('❌ Lỗi:', err));