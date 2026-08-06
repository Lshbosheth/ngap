module.exports = {
    plugins: [
        // 转换CSS语法为Chrome80+支持
        require('postcss-preset-env')({
            // 匹配Chrome80+
            browsers: ['Chrome >= 80'],
            stage: 3,
            features: {
                'gap-properties': false,
                'aspect-ratio': false,
                'logical-properties-and-values': false, // 禁用逻辑属性（如inline-size）
                'nesting-rules': false,
                'custom-properties': {
                    // 开启CSS变量兼容，解决多层嵌套失效问题
                    preserve: true,
                    warnings: false,
                },
            },
            preserve: true,
        }),
        // 自动为CSS属性添加浏览器前缀（如-webkit-）
        require('autoprefixer')({
            overrideBrowserslist: ['Chrome >= 80'],
            flexbox: 'no-2009',
        }),
    ],
};
