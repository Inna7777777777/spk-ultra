import React from 'react'
import { Modal, Descriptions, Typography, Divider, Alert } from 'antd'
import { QRCode } from 'antd'

const { Text } = Typography

export default function ReceiptModal({ open, onClose, receipt }) {
  if (!receipt) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} title="Квитанция">
        <Alert type="warning" message="Нет данных квитанции" />
      </Modal>
    )
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Квитанция на оплату взносов" width={720}>
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Получатель">{receipt.receiver}</Descriptions.Item>
        <Descriptions.Item label="Банк">{receipt.bank}</Descriptions.Item>
        <Descriptions.Item label="ИНН">{receipt.inn}</Descriptions.Item>
        <Descriptions.Item label="КПП">{receipt.kpp}</Descriptions.Item>
        <Descriptions.Item label="Р/счёт">{receipt.account}</Descriptions.Item>
        <Descriptions.Item label="Корр. счёт">{receipt.corr_account}</Descriptions.Item>
        <Descriptions.Item label="БИК">{receipt.bik}</Descriptions.Item>
        <Descriptions.Item label="Сумма">{receipt.amount} ₽</Descriptions.Item>
        <Descriptions.Item label="Назначение платежа" span={2}>
          {receipt.purpose}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Text strong>QR-код для СБП / банка (платёжное назначение):</Text>
      <div style={{ marginTop: 12, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <QRCode value={receipt.sbp_payload || ''} />
        <div style={{ maxWidth: 360 }}>
          <Text type="secondary">
            Отсканируйте QR-код мобильным приложением банка, поддерживающим СБП, либо используйте строку ниже
            вручную:
          </Text>
          <br />
          <Text code style={{ display: 'block', marginTop: 8, fontSize: 11 }}>
            {receipt.sbp_payload}
          </Text>
        </div>
      </div>
    </Modal>
  )
}
