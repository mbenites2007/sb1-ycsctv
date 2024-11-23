export const exportToCSV = (data: any[], filename: string) => {
  // Converter os dados para formato CSV
  const csvContent = data.map(row => 
    Object.values(row)
      .map(value => `"${value}"`)
      .join(',')
  ).join('\n');

  // Criar o blob com encoding UTF-8 e BOM para Excel
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  
  // Criar link para download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};