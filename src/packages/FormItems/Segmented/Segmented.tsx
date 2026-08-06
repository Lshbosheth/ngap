import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Typography } from 'antd';
import { Segmented, Form, Tabs } from 'antd';
import dayjs from 'dayjs';
import { ComponentType } from './../../types';
import { formatNumber, handleFormatter } from './../../utils/util';
import { omit } from 'lodash-es';
import { useAppContext } from './../../../utils/AppProvider';
import React from 'react';
import * as icons from '@ant-design/icons';
/**
 *
 * @param props 组件本身属性
 * @param style 组件样式
 * @returns
 *
 */
const iconsList: { [key: string]: any } = icons;
const MSegmented = ({ id, type, config, onChange }: ComponentType, ref: any) => {
    const [alignValue, setAlignValue] = useState(null);
    const [visible, setVisible] = useState(true);
    const [mStyle,setMStyle] = useState<any>({})

    const [data, setData] = useState([]);
    const { mode, pageStore } = useAppContext();
    const setElementAlias = pageStore((state: any) => state.setElementAlias);
    useEffect(() => {
        // 设置组件别名
        setElementAlias({ componentId: id, elementAlias: config.props.elementAlias });
    }, [config.props.elementAlias]);
    useEffect(() => {
        setAlignValue(config.props.defaultValue);
    }, [config.props.defaultValue]);
  useEffect(() => {
  const newData = Array.isArray(config.props.items)
    ? config.props.items.map((item: { label: any; icon: any }) => {
        switch (config.props.showType) {
          case '1':
            return { label: item.label,value: item.label };
          case '2':
            return {
              icon: React.createElement(
                iconsList[item.icon] ?? iconsList[Object.keys(iconsList)[0]]
              ),
              value: item.label
            };
          case '3':
            return {
              label: item.label,
              icon: React.createElement(
                iconsList[item.icon] ?? iconsList[Object.keys(iconsList)[0]]
              ),
              value: item.label
            };
          default:
            return { label: item.label,value: item.label };
        }
      })
    : [];

//   console.log('当前生成的 data 数据：', newData);

  setData(newData);
}, [config.props]);

    // 对外暴露方法
    useImperativeHandle(ref, () => {
        return {
            show() {
                setVisible(true);
            },
            hide() {
                setVisible(false);
            },
            setStyle:(style:any)=>{
                setMStyle(style)
            }
        };
    });
    const handleChange = (value: any) => {
        if (mode === 'preview') {
        setAlignValue(value);
        onChange?.();
        }
    };
    return (
        visible && (
            <Form.Item {...config.props.formItem} data-id={id} data-type={type}>
                {!config.props.hiddenTitle ? <span style={{ marginRight: '5px' }}>{config.props.text || '分段选择'} :</span> : ''}

                <Segmented
                    block={config.props.block}
                    value={alignValue}
                    onChange={(value) => {
                        handleChange(value);
                    }}
                    style={{...mStyle}}
                    options={data}
                />
            </Form.Item>
        )
    );
};
export default forwardRef(MSegmented);
