import type { VisitReport, StoreLocation } from '../types';

interface ExportOptions {
  periodLabel: string;
  startDate?: string;
  endDate?: string;
  reports: VisitReport[];
  uncompletedStores: { store: StoreLocation; lastVisitDate: string | null }[];
}

export function exportToExcelXLS({
  periodLabel,
  reports,
  uncompletedStores,
}: ExportOptions) {
  const sanitize = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Casa Pons Operations</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Casa Pons Fine Artisan Confectionery</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#1D1D1F"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D2D2D7"/>
   </Borders>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2C1810" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeaderStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="11" ss:Color="#2C1810" ss:Bold="1"/>
   <Interior ss:Color="#F5F5F7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" ss:Size="14" ss:Color="#1D1D1F" ss:Bold="1"/>
  </Style>
  <Style ss:ID="BoldStyle">
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#1D1D1F" ss:Bold="1"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="StatusCompleted">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#15803D" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusUrgent">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#B91C1C" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusPending">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" ss:Size="10" ss:Color="#B45309" ss:Bold="1"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- Worksheet 1: Visited Stores -->
 <Worksheet ss:Name="Visited Stores (${reports.length})">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="95"/>
   <Column ss:Width="85"/>
   <Column ss:Width="75"/>
   <Column ss:Width="160"/>
   <Column ss:Width="85"/>
   <Column ss:Width="95"/>
   <Column ss:Width="120"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="170"/>
   <Column ss:Width="85"/>
   <Column ss:Width="100"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="13" ss:StyleID="TitleStyle">
     <Data ss:Type="String">Casa Pons Store Visit Reports • ${sanitize(periodLabel)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Report ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Time</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Store Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Chain</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Region</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Merchandiser</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Stock (PCS)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">OOS Count</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Order Needed</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Order Qty</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Display Condition</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Cleanliness</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Audit Status</Data></Cell>
   </Row>
   ${reports
     .map((r) => {
       const orderQty = r.orderItems
         ? r.orderItems
             .filter((i) => i.requested)
             .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
         : 0;

       const statusStyle =
         r.status === 'Completed'
           ? 'StatusCompleted'
           : r.status === 'Urgent Restock'
           ? 'StatusUrgent'
           : 'StatusPending';

       return `
   <Row ss:Height="20">
    <Cell><Data ss:Type="String">${sanitize(r.id)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.formattedDate)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.formattedTime)}</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitize(r.store.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.store.chain)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.store.region)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.merchandiserName)} (${sanitize(r.merchandiserId)})</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${r.totalStockOnHand}</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${r.outOfStockCount}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.orderNeeded)}</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${orderQty}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(r.displayCondition)}</Data></Cell>
    <Cell><Data ss:Type="String">${r.isClean ? 'Yes (Clean)' : 'No (Needs Clean)'}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${sanitize(r.status)}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>

 <!-- Worksheet 2: Uncompleted Branches -->
 <Worksheet ss:Name="Uncompleted Branches (${uncompletedStores.length})">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="50"/>
   <Column ss:Width="180"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="140"/>
   <Column ss:Width="130"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="5" ss:StyleID="TitleStyle">
     <Data ss:Type="String">Uncompleted / Pending Store Visits • ${sanitize(periodLabel)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">#</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Store / Station Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Chain</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Region</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Last Known Visit</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Period Status</Data></Cell>
   </Row>
   ${uncompletedStores
     .map((item, idx) => `
   <Row ss:Height="20">
    <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitize(item.store.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(item.store.chain)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(item.store.region)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(item.lastVisitDate ? item.lastVisitDate : 'Never Visited')}</Data></Cell>
    <Cell ss:StyleID="StatusUrgent"><Data ss:Type="String">Pending Visit</Data></Cell>
   </Row>`)
     .join('')}
  </Table>
 </Worksheet>

 <!-- Worksheet 3: Network Audit Summary -->
 <Worksheet ss:Name="Coverage Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="180"/>
   <Column ss:Width="120"/>
   <Row ss:Height="26">
    <Cell ss:MergeAcross="1" ss:StyleID="TitleStyle">
     <Data ss:Type="String">Network Auditing KPI Summary</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Audit Period</Data></Cell>
    <Cell><Data ss:Type="String">${sanitize(periodLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Total Official Stores</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">113</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Choithrams Supermarkets</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">24</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Emarat Service Stations</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">89</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Stores Visited in Period</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${reports.length}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Uncompleted Branches</Data></Cell>
    <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${uncompletedStores.length}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Period Store Coverage Rate</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${Math.round((reports.length / 113) * 100)}%</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">Export Timestamp</Data></Cell>
    <Cell><Data ss:Type="String">${new Date().toLocaleString()}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Casa_Pons_Field_Report_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xls`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
