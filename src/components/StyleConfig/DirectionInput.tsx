// src/components/StyleConfig/DirectionInput.tsx
import { InputNumber } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import styles from './index.module.less';

interface DirectionInputProps {
    values: { top: number | null; right: number | null; bottom: number | null; left: number | null };
    onChange: (direction: string, value: number | null) => void;
    title: string;
    description: string;
    type: string;
    name: string;
}

const DirectionInput = ({ type, values, onChange, title, description, name }: DirectionInputProps) => {
    const hasValue = (v: number | null | undefined) => v != null && typeof v !== "undefined";
    const isCustom = hasValue(values.top) || hasValue(values.right) || hasValue(values.bottom) || hasValue(values.left);

    const handleChange = (field: string, value: number | null) => {
        onChange(field, value);
    };

    const inputStyle = { width: 68 };

    return (
        <div className={styles.directionGroup}>
            <div className={styles.directionTitle}>
                <span className={styles.titleText}>{title}</span>
                <span className={styles.descText}>{description}</span>
            </div>
            <div className={styles.directionBody}>
                <div className={`${styles.boxDiagram} ${type === 'margin' ? styles.marginDiagram : styles.paddingDiagram}`}>
                    <div className={styles.boxOuter}>
                        <div className={styles.boxInner}></div>
                    </div>
                </div>
                <div className={styles.chainIcon}>
                    <LinkOutlined className={isCustom ? styles.chainActive : styles.chainInactive} />
                </div>
                <div className={styles.inputsGrid}>
                    <div className={styles.inputRow}>
                        <div className={styles.inputItem}>
                            <span className={styles.inputLabel}>上</span>
                            <InputNumber value={values.top} onChange={(v) => handleChange('top', v)} style={inputStyle} size="small" controls={false} placeholder="0" />
                        </div>
                        <div className={styles.inputItem}>
                            <span className={styles.inputLabel}>右</span>
                            <InputNumber value={values.right} onChange={(v) => handleChange('right', v)} style={inputStyle} size="small" controls={false} placeholder="0" />
                        </div>
                    </div>
                    <div className={styles.inputRow}>
                        <div className={styles.inputItem}>
                            <span className={styles.inputLabel}>下</span>
                            <InputNumber value={values.bottom} onChange={(v) => handleChange('bottom', v)} style={inputStyle} size="small" controls={false} placeholder="0" />
                        </div>
                        <div className={styles.inputItem}>
                            <span className={styles.inputLabel}>左</span>
                            <InputNumber value={values.left} onChange={(v) => handleChange('left', v)} style={inputStyle} size="small" controls={false} placeholder="0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectionInput;
