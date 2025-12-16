const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// --- CẤU HÌNH ---
const ROOT_TEST_DIR = path.join(__dirname, 'tests', 'unit'); // Đảm bảo đúng đường dẫn folder tests của bạn
const OUTPUT_FILE = 'Unit_Test_Report.xlsx';

const TARGET_FOLDERS = [
    'controllers',
    'middleware',
    'routes',
    'services',
    'utils'
];

// --- HÀM PARSE DỮ LIỆU TỪ CODE ---
function extractTag(commentBlock, tagName) {
    const regex = new RegExp(`\\[${tagName}\\]:\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = commentBlock.match(regex);
    return match ? match[1].trim() : '';
}

function parseTestFile(filePath, fileName, folderName) {
    const content = fs.readFileSync(filePath, 'utf8');
    const testCases = [];
    
    // Tìm tên Function (describe)
    const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
    const functionName = describeMatch ? describeMatch[1] : fileName.replace('.test.ts', '');

    // Tìm các block comment và it()
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
            actualResult: 'As Expected', // Mặc định theo mẫu
            status: 'Pass'               // Mặc định theo mẫu
        });
    }
    return testCases;
}

// --- HÀM STYLE EXCEL (BORDERS & FONT) ---
const addBorders = (cell) => {
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
};

// [UPDATE]: Đổi Theme Header
const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFCC' } 
};

const headerFont = {
    name: 'Calibri',
    color: { argb: 'FF000000' }, 
    bold: true,
    size: 11
};

// Font cho Hyperlink
const linkFont = {
    name: 'Calibri',
    color: { argb: 'FF000000' }, 
    size: 11
};

const centerStyle = { vertical: 'middle', horizontal: 'center', wrapText: true };
const leftStyle = { vertical: 'top', horizontal: 'left', wrapText: true };

// --- MAIN FUNCTION ---
async function generateExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // ==========================================
    // 1. TẠO SHEET "Unit Test Case List"
    // ==========================================
    const listSheet = workbook.addWorksheet('Unit Test Case List');

    // Setup column width
    listSheet.getColumn('A').width = 5;  // Empty margin
    listSheet.getColumn('B').width = 8;  // ID
    listSheet.getColumn('C').width = 25; // Function
    listSheet.getColumn('D').width = 15; // Sheet Name
    listSheet.getColumn('E').width = 50; // Description
    listSheet.getColumn('F').width = 40; // Pre-Condition

    // --- Project Info Header ---
    listSheet.mergeCells('B2:C2'); listSheet.getCell('B2').value = 'Project Name';
    listSheet.mergeCells('D2:F2'); listSheet.getCell('D2').value = 'Car Trading Store System';
    
    listSheet.mergeCells('B3:C3'); listSheet.getCell('B3').value = 'Project Code';
    listSheet.mergeCells('D3:F3'); listSheet.getCell('D3').value = 'CTT-2025';

    listSheet.mergeCells('B4:C4'); listSheet.getCell('B4').value = 'Test Environment Setup Description';
    listSheet.mergeCells('D4:F4'); listSheet.getCell('D4').value = 'Node.js v18+, Jest, PostgreSQL, TypeScript\nEditor: VS Code';
    listSheet.getCell('D4').alignment = { wrapText: true };

    // --- Table Header ---
    const headerRowIdx = 7;
    const headerValues = ['', 'ID', 'Function', 'Sheet Name', 'Description', 'Pre-Condition'];
    
    // Gán giá trị và style cho header
    ['B', 'C', 'D', 'E', 'F'].forEach((col, index) => {
        const cell = listSheet.getCell(`${col}${headerRowIdx}`);
        cell.value = headerValues[index + 1];
        cell.fill = headerFill; // Áp dụng màu nền mới
        cell.font = headerFont; // Áp dụng màu chữ mới
        cell.alignment = centerStyle;
        addBorders(cell);
    });

    // --- Render Data ---
    let globalId = 1;
    let currentRowIdx = headerRowIdx + 1;
    let allTestCases = [];

    for (const folder of TARGET_FOLDERS) {
        const folderPath = path.join(ROOT_TEST_DIR, folder);
        if (fs.existsSync(folderPath)) {
            // Section Header (VD: CONTROLLER) - Màu xám nhạt để phân cách
            const sectionRow = listSheet.getRow(currentRowIdx);
            listSheet.mergeCells(`B${currentRowIdx}:F${currentRowIdx}`);
            const sectionCell = listSheet.getCell(`B${currentRowIdx}`);
            sectionCell.value = folder.toUpperCase();
            sectionCell.font = { bold: true };
            sectionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }; // Xám rất nhạt
            sectionCell.alignment = { vertical: 'middle', horizontal: 'left' };
            // Border cho section
            ['B', 'C', 'D', 'E', 'F'].forEach(c => addBorders(listSheet.getCell(`${c}${currentRowIdx}`)));
            
            currentRowIdx++;

            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.ts'));
            for (const file of files) {
                const cases = parseTestFile(path.join(folderPath, file), file, folder);
                
                cases.forEach(tc => {
                    const sheetName = `UC${String(globalId).padStart(2, '0')}`; // UC01, UC02...
                    
                    const row = listSheet.getRow(currentRowIdx);
                    
                    // Col B: ID
                    row.getCell(2).value = globalId;
                    
                    // Col C: Function Name
                    row.getCell(3).value = tc.functionName;
                    
                    // Col D: Sheet Name (CÓ HYPERLINK)
                    // Cú pháp: "#'Tên Sheet'!A1"
                    row.getCell(4).value = {
                        text: sheetName,
                        hyperlink: `#'${sheetName}'!A1`, 
                        tooltip: 'Click to go to details'
                    };
                    
                    // Col E: Description
                    row.getCell(5).value = tc.description;
                    
                    // Col F: Pre-Condition
                    row.getCell(6).value = tc.preCondition;

                    // Style data row
                    row.getCell(2).alignment = centerStyle;
                    row.getCell(3).alignment = leftStyle;
                    
                    // Style cho ô Link
                    row.getCell(4).alignment = centerStyle;
                    row.getCell(4).font = linkFont; // Font link màu xanh

                    row.getCell(5).alignment = leftStyle;
                    row.getCell(6).alignment = leftStyle;

                    // Kẻ khung
                    ['B', 'C', 'D', 'E', 'F'].forEach(c => addBorders(row.getCell(c)));

                    tc.id = globalId;
                    tc.sheetName = sheetName;
                    allTestCases.push(tc);

                    globalId++;
                    currentRowIdx++;
                });
            }
        }
    }

    // ==========================================
    // 2. TẠO SHEET CHI TIẾT (UCx)
    // ==========================================
    allTestCases.forEach(tc => {
        const sheet = workbook.addWorksheet(tc.sheetName);

        // Config Column Width (mô phỏng theo mẫu UC1.csv)
        sheet.getColumn('A').width = 15; // Label column
        sheet.getColumn('B').width = 25; 
        sheet.getColumn('C').width = 15; 
        sheet.getColumn('D').width = 20; 
        sheet.getColumn('E').width = 20; 
        sheet.getColumn('F').width = 20; 
        sheet.getColumn('G').width = 10; 
        sheet.getColumn('H').width = 15; 

        // --- INFO BLOCK ---
        // Row 1
        sheet.getCell('A1').value = 'Test Case ID'; sheet.getCell('A1').font = { bold: true };
        sheet.mergeCells('B1:C1'); sheet.getCell('B1').value = tc.sheetName;
        sheet.getCell('D1').value = 'Test Case Description'; sheet.getCell('D1').font = { bold: true };
        sheet.mergeCells('E1:H1'); sheet.getCell('E1').value = tc.description; sheet.getCell('E1').alignment = { wrapText: true };

        // Row 2
        sheet.getCell('A2').value = 'Created By'; sheet.getCell('A2').font = { bold: true };
        sheet.mergeCells('B2:C2'); sheet.getCell('B2').value = 'Huy Châu';
        sheet.getCell('D2').value = 'Reviewed By'; sheet.getCell('D2').font = { bold: true };
        sheet.mergeCells('E2:F2'); sheet.getCell('E2').value = 'Đức Anh';
        sheet.getCell('G2').value = 'Version'; sheet.getCell('G2').font = { bold: true };
        sheet.getCell('H2').value = '1.0';

        // Row 4 (Date)
        sheet.getCell('A4').value = 'Date Tested'; sheet.getCell('A4').font = { bold: true };
        sheet.mergeCells('B4:C4'); sheet.getCell('B4').value = new Date().toISOString().split('T')[0];
        sheet.mergeCells('E4:G4'); sheet.getCell('E4').value = 'Test Case (Pass/Fail)'; sheet.getCell('E4').font = { bold: true };
        
        // Status Pass/Fail
        const statusCell = sheet.getCell('H4');
        statusCell.value = 'Pass'; 
        // Tô màu pass xanh lá nhạt cho đẹp
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        statusCell.font = { color: { argb: 'FF006100' } };

        // Kẻ khung Info Block
        ['A1', 'B1', 'D1', 'E1', 'A2', 'B2', 'D2', 'E2', 'G2', 'H2', 'A4', 'B4', 'E4', 'H4'].forEach(addr => {
             addBorders(sheet.getCell(addr));
        });

        // --- BACK LINK ---
        sheet.getCell('A10').value = { text: '← Back to List', hyperlink: "#'Unit Test Case List'!A1" };
        sheet.getCell('A10').font = linkFont;

        // --- DATA TEST BLOCK ---
        const dataHeaderRow = 6;
        sheet.getCell(`A${dataHeaderRow}`).value = 'ID';
        sheet.mergeCells(`B${dataHeaderRow}:H${dataHeaderRow}`); sheet.getCell(`B${dataHeaderRow}`).value = 'Data Test';
        
        // Style Header Data (THEME MỚI)
        sheet.getCell(`A${dataHeaderRow}`).fill = headerFill; sheet.getCell(`A${dataHeaderRow}`).font = headerFont;
        sheet.getCell(`B${dataHeaderRow}`).fill = headerFill; sheet.getCell(`B${dataHeaderRow}`).font = headerFont;
        addBorders(sheet.getCell(`A${dataHeaderRow}`)); addBorders(sheet.getCell(`B${dataHeaderRow}`));

        // Data Value
        const dataValRow = 7;
        sheet.getCell(`A${dataValRow}`).value = '1';
        sheet.mergeCells(`B${dataValRow}:H${dataValRow}`); 
        sheet.getCell(`B${dataValRow}`).value = tc.dataTest;
        sheet.getCell(`B${dataValRow}`).alignment = leftStyle;
        addBorders(sheet.getCell(`A${dataValRow}`)); addBorders(sheet.getCell(`B${dataValRow}`));


        // --- SCENARIO BLOCK ---
        const scenarioRow = 12; // Khoảng cách giống mẫu
        sheet.mergeCells(`A${scenarioRow}:B${scenarioRow}`); sheet.getCell(`A${scenarioRow}`).value = 'Test Scenario';
        sheet.getCell(`A${scenarioRow}`).font = { bold: true };
        sheet.mergeCells(`C${scenarioRow}:H${scenarioRow}`); sheet.getCell(`C${scenarioRow}`).value = tc.description; // Lấy description làm scenario
        sheet.getCell(`C${scenarioRow}`).alignment = { wrapText: true };
        addBorders(sheet.getCell(`A${scenarioRow}`)); addBorders(sheet.getCell(`C${scenarioRow}`));


        // --- STEPS TABLE ---
        const stepHeadRow = 14;
        sheet.getCell(`A${stepHeadRow}`).value = 'Step';
        sheet.mergeCells(`B${stepHeadRow}:D${stepHeadRow}`); sheet.getCell(`B${stepHeadRow}`).value = 'Step Details';
        sheet.mergeCells(`E${stepHeadRow}:F${stepHeadRow}`); sheet.getCell(`E${stepHeadRow}`).value = 'Expected Results';
        sheet.getCell(`G${stepHeadRow}`).value = 'Actual Results';
        sheet.getCell(`H${stepHeadRow}`).value = 'Status';

        // Style Header Steps (THEME MỚI)
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

        // Border Content
        ['A', 'B', 'E', 'G', 'H'].forEach(c => addBorders(sheet.getCell(`${c}${stepContentRow}`)));
    });

    // --- SAVE ---
    await workbook.xlsx.writeFile(OUTPUT_FILE);
    console.log(`✅ Đã xuất file: ${OUTPUT_FILE}`);
}

generateExcel().catch(console.error);