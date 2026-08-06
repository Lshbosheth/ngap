import { useState } from 'react';
import { Modal, Button } from 'antd';
import IconSearchForm from '@/config/icons/IconSearcFrom';
import IconForm from '@/config/icons/IconForm';
import IconGridForm from '@/config/icons/IconGridForm';
import IconSearchFormB from '@/config/icons/IconSearchFormB';
import IconFormB from '@/config/icons/IconFormB';
import IconGridFormB from '@/config/icons/IconGridFormB';

const iconMap: Record<string, any> = {
  SearchForm: IconSearchForm,
  Form: IconForm,
  GridForm: IconGridForm,
};

const selectedIconMap: Record<string, any> = {
  SearchForm: IconSearchFormB,
  Form: IconFormB,
  GridForm: IconGridFormB,
};

const formContainerOptions = [
  { label: '表单容器', value: 'Form' },
  // { label: '网格表单', value: 'GridForm' },
  { label: '行内表单', value: 'SearchForm' },
];

interface FormItemModalProps {
  open: boolean;
  elementName: string;
  onOk: (containerType: string) => void;
  onCancel: () => void;
}

const FormItemModal = ({ open, elementName, onOk, onCancel }: FormItemModalProps) => {
  const [selectedType, setSelectedType] = useState(formContainerOptions[0].value);

  const handleOk = () => {
    onOk(selectedType);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="表单项说明"
      open={open}
      footer={null}
      destroyOnClose
      maskClosable={false}
      onCancel={handleCancel}
      width={480}
      afterOpenChange={(visible) => {
        if (visible) {
          setSelectedType(formContainerOptions[0].value);
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '10px 0px 20px' }}>
          <p style={{ marginBottom: 24, color: '#333', fontSize: 14, lineHeight: '1.6' }}>
            当前选中的"{elementName}"元素，需搭配"行内表单"或"表单容器"布局使用，请选择下方布局。
          </p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 8 }}>
            {formContainerOptions.map((item) => {
              const isSelected = selectedType === item.value;
              const IconComponent = isSelected ? selectedIconMap[item.value] : iconMap[item.value];
              return (
                <div
                  key={item.value}
                  onClick={() => setSelectedType(item.value)}
                  style={{
                    width: 110,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      // width: 68,
                      height: 65,
                      // border: `1px solid ${isSelected ? '#1890ff' : '#D9D9D9'}`,
                      borderRadius: 4
                    }}
                  >
                    {IconComponent && IconComponent({ width: '56px', height: '44px' })}
                  </div>
                  <span style={{ fontSize: 13, color: '#333' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            height: '60px',
            background: '#F9FAFC',
            borderTop: '1px solid #D0D6D9',
            textAlign: 'center',
            paddingTop: '10px',
            margin: '0 -24px -24px',
            padding: '8px 24px',
            boxSizing: 'border-box',
          }}
        >
          <Button
            type="primary"
            onClick={handleOk}
            style={{ marginRight: 17, width: '140px', height: '40px' }}
          >
            确定
          </Button>
          <Button onClick={handleCancel} style={{ width: '140px', height: '40px' }}>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FormItemModal;
