import {
    Button, Col, DatePicker, Form, Input, Row, Select,
    Table, TreeSelect, Pagination, message
} from "antd";
import {ForwardedRef, forwardRef, ReactNode, useEffect, useImperativeHandle, useState} from "react";
import './index.less'
import {isEmpty} from "@/utils/util";
import request from '@/utils/request';

const {RangePicker} = DatePicker
const {TreeNode} = TreeSelect

interface CommonListProps {
    filterOpts: object[],
    lineCount: number,
    columns: object[],
    url: string,
    type?: 'post' | 'get',
    extraParams: object,
    btns?: any[]
}

export interface CommonListRef {
    getParams: () => any
}

const CommonList =forwardRef( ({filterOpts, lineCount, columns, url, type = 'post', extraParams, btns}: CommonListProps, ref:ForwardedRef<any>) => {
    const [form] = Form.useForm()

    const [loading, setLoading] = useState(false)

    const [dataSource, setDataSource] = useState([])

    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [total, setTotal] = useState(0)

    const onSearch = () => {
        pageNum !== 1 ? setPageNum(1) : doFetch()
    }

    const showTotal = (total: any) => {
        return `共${total}条数据`;
    }

    const onChange = (pageNum: any, pageSize: any) => {
        setPageNum(pageNum)
        setPageSize(pageSize)
    }

    const onShowSizeChange = (pageNum: any, pageSize: any) => {
        setPageNum(1)
        setPageSize(pageSize)
    }

    const getDateFormat = (showTime:boolean) => {
        return `YYYY-MM-DD${showTime ? ' HH:mm:ss' : ''}`
    }

    const onReset = () => {
        form.resetFields()
        pageNum !== 1 ? setPageNum(1) : doFetch()
    }

    const getOuterColSpan = () => {
        return 24 / (lineCount || 4)
    }

    useEffect(() => {
        doFetch()
    }, [pageNum, pageSize])

    useImperativeHandle(ref, () => ({
        getParams() {
            return getFieldsParams()
        }
    }))

    const getFieldsParams = () => {
        const fields = form.getFieldsValue()
        let params: any = {}
        filterOpts.forEach((opt: any) => {
            const dateFormat = opt.format || getDateFormat(opt.showTime)
            if (opt.type === 'dateRangePicker') {
                params[opt.keyStart] = (fields[opt.key] && fields[opt.key][0]) ? fields[opt.key][0].format(dateFormat) : ''
                params[opt.keyEnd] = (fields[opt.key] && fields[opt.key][1]) ? fields[opt.key][1].format(dateFormat) : ''
            } else if (opt.type === 'datePicker') {
                params[opt.key] = fields[opt.key] ? fields[opt.key].format(dateFormat) : ''
            } else if (opt.type === 'select' && opt.multiple) {
                if (!isEmpty(fields[opt.key])) {
                    params[opt.key] = fields[opt.key].join(',')
                }
            } else {
                params[opt.key] = fields[opt.key]
            }
        })
        params.start = (pageNum - 1) * pageSize
        params.limit = pageSize

        return params
    }

    const doFetch = async () => {
        setLoading(true)
        const params = {...getFieldsParams(), ...extraParams}
        try {
            const res:any = await request[type](url, {params})
            setDataSource(res?.beans || [])
            setTotal(res?.bean.total || 0)
        } catch (e) {
        }
        setLoading(false)
    }

    //查询 重置按钮占位
    const getOuterRestSpan = () => {
        return 24 - (filterOpts.length % lineCount) * getOuterColSpan()
    }

    const renderNode = (menus: any[], node: any) => {
        return menus.map((menu: any) => {
            if (menu.children && menu.children.length > 0) {
                return <TreeNode value={menu[node.value]} title={menu[node.title]}
                                 key={menu[node.value]}>
                    {renderNode(menu.children, node)}
                </TreeNode>
            }
            return <TreeNode value={menu[node.value]} key={menu[node.value]}
                             title={menu[node.title]}/>
        })
    }

    const getSpan = (opt: any) => {
        const allowClear = !opt.cantClear
        if (opt.type === 'input') {
            return <Input placeholder={`请输入${opt.label}`}
                          style={{width: '100%'}} allowClear={allowClear}/>
        }
        if (opt.type === 'select') {
            return <Select
                placeholder={`请选择${opt.label}`}
                optionFilterProp={'children'}
                showArrow
                allowClear={allowClear}
                showSearch
                onChange={opt.onChange}
                style={{width: '100%'}}>
                {opt.opts?.map((item: any) => {
                    return <Select.Option value={item.value}>{item.title}</Select.Option>
                })}
            </Select>
        }

        if (opt.type === 'tree') {
            return <TreeSelect
                style={{width: '100%'}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                allowClear={allowClear}
                placeholder={`请选择${opt.label}`}
                treeDefaultExpandAll>
                {renderNode(opt.opts, opt.node)}
            </TreeSelect>
        }

        if (opt.type === 'datePicker') {
            return <DatePicker
                showTime={opt.showTime}
                placeholder={`请选择${opt.label}`} format={opt.format || getDateFormat(opt.showTime)}
                style={{width: '100%'}} allowClear={allowClear}/>
        }

        if (opt.type === 'dateRangePicker') {
            return <RangePicker
                showTime={opt.showTime} allowClear={allowClear}
                format={opt.format || getDateFormat(opt.showTime)} style={{width: '100%'}}/>
        }
        return ''
    }

    return <div className={'common-list-wrap'}>
        <Form form={form}>
            <Row gutter={24}>
                {filterOpts.map((opt: any) => {
                    return <Col span={getOuterColSpan()}>
                        <Form.Item label={opt.label} name={opt.key} style={{width: '100%'}}>
                            {getSpan(opt)}
                        </Form.Item></Col>
                })}

                <Col style={{paddingLeft: 0, paddingRight: 10}} className={'common-list-buttons'}
                     span={getOuterRestSpan()}>
                    <Button type={'primary'}
                            loading={loading} onClick={onSearch}>查询</Button>
                    <Button type={'primary'} className={'btn-right'} onClick={onReset} ghost>重置</Button>

                    {btns?.map((btn: any) => <Button type={'primary'} className={'btn-right'} ghost={btn.ghost}
                                                     onClick={btn.onClick}>{btn.label}</Button>)}
                </Col>

            </Row>
        </Form>

        <div className={'common-list-table-wrap'}>
            <Table loading={loading} scroll={{y: 500}}
                   pagination={false} columns={columns} dataSource={dataSource}/>

            <Pagination
                showSizeChanger showQuickJumper
                showTotal={showTotal}
                current={pageNum}
                pageSize={pageSize}
                onChange={onChange}
                pageSizeOptions={['10', '20', '50', '100']}
                className={'common-list-pagination'}
                onShowSizeChange={onShowSizeChange}
                total={total}/>
        </div>
    </div>
})

export default CommonList
