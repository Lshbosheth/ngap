// scripts/get-git-branch.js
const { execSync } = require('child_process');

function getGitBranch() {
    const ciBranch = process.env.CI_COMMIT_BRANCH || process.env.BRANCH_NAME || process.env.GIT_BRANCH;
    if (ciBranch) return ciBranch.trim();

    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();

        // 处理 detached HEAD 状态
        if (branch === 'HEAD') {
            const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
            return `detached-${commit}`;
        }
        return branch;
    } catch (error) {
        console.warn('获取 Git 分支失败，使用默认值：unknown-branch');
        return 'unknown-branch';
    }
}

module.exports = getGitBranch;
