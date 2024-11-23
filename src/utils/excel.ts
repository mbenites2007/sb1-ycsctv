import { utils, writeFile } from 'xlsx';
import { Order } from '../types';

export const exportOrderToExcel = (order: Order) => {
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Create header section
  const headerData = [
    ['ORÇAMENTO', `#${order.code}`],
    ['Data', formatDate(order.date)],
    [''],
    ['CLIENTE'],
    ['Nome', order.clientName],
    ['CNPJ', order.clientDocument],
    ['Cidade', order.clientCity],
    ['Estado', order.clientState],
    ['']
  ];

  // Group items by service
  const itemsByService = order.items.reduce((acc, item) => {
    if (!acc[item.serviceId]) {
      acc[item.serviceId] = [];
    }
    acc[item.serviceId].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

  // Create items section
  const itemsData: any[] = [];
  Object.entries(itemsByService).forEach(([_, items]) => {
    // Add service header
    itemsData.push(['']);
    itemsData.push([
      'Código',
      'Descrição',
      'Unidade',
      'Quantidade',
      'Valor Unitário',
      'Total'
    ]);

    // Add items
    items.forEach(item => {
      itemsData.push([
        item.code,
        item.description,
        item.unit,
        item.quantity,
        formatCurrency(item.unitPrice),
        formatCurrency(item.total)
      ]);
    });
  });

  // Create totals section
  const totalsData = [
    [''],
    ['Subtotal', formatCurrency(order.subtotal)],
    ['Desconto', formatCurrency(order.discount)],
    ['TOTAL', formatCurrency(order.total)]
  ];

  // Create observations section if exists
  const observationsData = order.observations ? [
    [''],
    ['OBSERVAÇÕES'],
    [order.observations]
  ] : [];

  // Combine all sections
  const wsData = [
    ...headerData,
    ...itemsData,
    ...totalsData,
    ...observationsData
  ];

  // Create worksheet
  const ws = utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // A
    { wch: 40 }, // B
    { wch: 10 }, // C
    { wch: 12 }, // D
    { wch: 15 }, // E
    { wch: 15 }, // F
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Orçamento');

  // Apply styles
  // Headers
  ['A1:B1', 'A4', 'A6:B9'].forEach(range => {
    const [start, end] = range.split(':');
    const startCell = utils.decode_cell(start);
    const endCell = end ? utils.decode_cell(end) : startCell;
    
    for (let R = startCell.r; R <= endCell.r; R++) {
      for (let C = startCell.c; C <= endCell.c; C++) {
        const cellRef = utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;
        
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EFEFEF" } }
        };
      }
    }
  });

  // Save file
  writeFile(wb, `orcamento-${order.code}.xlsx`);
};