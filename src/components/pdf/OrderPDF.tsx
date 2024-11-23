import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Order } from '../../types';

interface OrderPDFProps {
  order: Order;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 15
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 14,
    marginBottom: 2,
    color: '#334155',
    fontWeight: 'bold'
  },
  companyDetails: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 1
  },
  documentInfo: {
    alignItems: 'flex-end'
  },
  documentTitle: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4
  },
  documentDate: {
    fontSize: 8,
    color: '#64748b'
  },
  clientInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc'
  },
  clientRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  clientColumn: {
    flex: 1
  },
  label: {
    color: '#64748b',
    marginBottom: 1,
    fontSize: 8
  },
  value: {
    color: '#334155',
    fontSize: 9
  },
  table: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 2
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 4,
    minHeight: 20,
    alignItems: 'center'
  },
  serviceSection: {
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: '#eef2ff',
    padding: 8,
    borderRadius: 4
  },
  serviceHeader: {
    marginBottom: 4
  },
  serviceTitle: {
    color: '#4f46e5',
    fontSize: 10,
    fontWeight: 'bold'
  },
  colSeq: { width: '8%' },
  colDesc: { width: '45%' },
  colUnit: { width: '12%' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '11%', textAlign: 'right' },
  colTotal: { width: '12%', textAlign: 'right' },
  totals: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
    color: '#64748b'
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    color: '#334155'
  },
  grandTotal: {
    fontSize: 11,
    color: '#4f46e5',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  serviceSubtotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderStyle: 'dashed'
  }
});

const OrderPDF: React.FC<OrderPDFProps> = ({ order }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Agrupar itens por serviço
  const itemsByService = order.items.reduce((acc, item) => {
    if (!acc[item.serviceId]) {
      acc[item.serviceId] = {
        title: item.description.split('.')[0],
        items: []
      };
    }
    acc[item.serviceId].items.push(item);
    return acc;
  }, {} as Record<string, { title: string; items: typeof order.items }>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>SQL Tecnologia e Serviços Ltda - SQLINK</Text>
              <Text style={styles.companyDetails}>CNPJ: 19.671.911/0001-79</Text>
              <Text style={styles.companyDetails}>
                Praça Presidente Getúlio Vargas, 35 Sala 1304 - Centro
              </Text>
              <Text style={styles.companyDetails}>Vitória - ES, 29.010-350</Text>
              <Text style={styles.companyDetails}>Tel: (27) 3207-8793</Text>
              <Text style={styles.companyDetails}>E-mail: carlos.goncalves@sqlink.com.br</Text>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>
                Orçamento #{order.code}
              </Text>
              <Text style={styles.documentDate}>
                {formatDate(order.date)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.clientInfo}>
          <View style={styles.clientRow}>
            <View style={styles.clientColumn}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{order.clientName}</Text>
            </View>
            <View style={styles.clientColumn}>
              <Text style={styles.label}>CNPJ:</Text>
              <Text style={styles.value}>{order.clientDocument}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          {Object.entries(itemsByService).map(([serviceId, { title, items }], serviceIndex) => {
            const serviceSubtotal = items.reduce((sum, item) => sum + item.total, 0);

            return (
              <View key={serviceId}>
                <View style={styles.serviceSection}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceTitle}>
                      {`${serviceIndex + 1}. ${title}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={styles.colSeq}>Item</Text>
                  <Text style={styles.colDesc}>Descrição</Text>
                  <Text style={styles.colUnit}>Unidade</Text>
                  <Text style={styles.colQty}>Qtde</Text>
                  <Text style={styles.colPrice}>Valor Unit.</Text>
                  <Text style={styles.colTotal}>Total</Text>
                </View>

                {items.map((item, itemIndex) => (
                  <View key={`${serviceId}-${itemIndex}`} style={styles.tableRow}>
                    <Text style={styles.colSeq}>{`${serviceIndex + 1}.${itemIndex + 1}`}</Text>
                    <Text style={styles.colDesc}>{item.description}</Text>
                    <Text style={styles.colUnit}>{item.unit}</Text>
                    <Text style={styles.colQty}>{item.quantity}</Text>
                    <Text style={styles.colPrice}>
                      {formatCurrency(item.unitPrice)}
                    </Text>
                    <Text style={styles.colTotal}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))}

                <View style={styles.serviceSubtotal}>
                  <Text style={styles.totalLabel}>Subtotal do Serviço:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(serviceSubtotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          
          {order.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Desconto:</Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrderPDF;