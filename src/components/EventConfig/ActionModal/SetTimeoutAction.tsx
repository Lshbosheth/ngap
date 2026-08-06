import { Divider, Form, Input, InputNumber, Radio } from 'antd';
import styles from './index.module.less';
const OpenModalAction = () => {

    const options = [
        { label: '推迟', value: 'timeOut', className: 'label-1' },
        { label: '定时', value: 'timeInterval', className: 'label-2' },
        { label: '清除定时', value: 'timeClean', className: 'label-23' }
      ]

    return (
        <>
        <div className={styles.desc}>
          <h3 className={styles.descTitle}>说明</h3>
          <p className={styles.descInfo}>触发动作后，会执行setTimeout做延迟。比如：延迟3秒执行下一个任务。</p>
          <Divider />
        </div>
    
        <Form.Item label="任务类型" name="timeType" rules={[{ required: true, message: '请选择任务类型' }]}>
          <Radio.Group
            options={options}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
    
        <Form.Item 
          noStyle 
          shouldUpdate={(prevValues, currentValues) => prevValues.timeType !== currentValues.timeType}
        >
          {({ getFieldValue }) => {
            const timeType = getFieldValue('timeType');
            return timeType === 'timeInterval' ? (
              <Form.Item label="次数" name="timeCount" rules={[{ required: false, message: '请输入次数' }]}>
                <InputNumber min={1} placeholder="eg: 5" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
    
        {/* 时间输入框：当 type 为清除时隐藏 */}
        <Form.Item 
          noStyle 
          shouldUpdate={(prevValues, currentValues) => prevValues.timeType !== currentValues.timeType}
        >
          {({ getFieldValue }) => {
            const timeType = getFieldValue('timeType');
            return timeType !== 'timeClean' ? (
              <Form.Item label="时间（秒）" name="duration" rules={[{ required: true, message: '请输入持续时间' }]}>
                <InputNumber placeholder="eg: 3" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
      </>
    );
};
export default OpenModalAction;
