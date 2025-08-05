import { type GroupWithStats } from "@shared/schema";

export function exportToPDF(groups: GroupWithStats[]) {
  // Create a simple PDF export using HTML content
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalExpenses = groups.reduce((sum, group) => sum + parseFloat(group.totalExpenses), 0);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SplitSmart - Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #8B5CF6; font-size: 24px; font-weight: bold; }
        .subtitle { color: #666; margin-top: 5px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .group { margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; }
        .group-header { font-size: 18px; font-weight: bold; color: #8B5CF6; margin-bottom: 10px; }
        .group-details { color: #666; font-size: 14px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #8B5CF6; }
        .stat-label { color: #666; font-size: 12px; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SplitSmart</div>
        <div class="subtitle">Group Expense Report</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div class="summary">
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${groups.length}</div>
            <div class="stat-label">Total Groups</div>
          </div>
          <div class="stat">
            <div class="stat-value">₹${totalExpenses.toFixed(2)}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
        </div>
      </div>
      
      <div class="groups">
        ${groups.map(group => `
          <div class="group">
            <div class="group-header">${group.icon} ${group.name}</div>
            <div class="group-details">
              <p><strong>Members:</strong> ${group.memberCount}</p>
              <p><strong>Total Expenses:</strong> ₹${group.totalExpenses}</p>
              ${group.recentExpense ? `<p><strong>Recent:</strong> ${group.recentExpense.description} - ₹${group.recentExpense.amount}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>Exported from SplitSmart - Smart Bill Splitter</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}

export function exportToCSV(groups: GroupWithStats[]) {
  const csvData = [
    ['Group Name', 'Icon', 'Members', 'Total Expenses', 'Recent Expense', 'Recent Amount'],
    ...groups.map(group => [
      group.name,
      group.icon,
      group.memberCount.toString(),
      group.totalExpenses,
      group.recentExpense?.description || 'N/A',
      group.recentExpense?.amount || '0'
    ])
  ];

  const csvContent = csvData.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `splitsmart-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
