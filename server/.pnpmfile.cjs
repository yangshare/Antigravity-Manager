module.exports = {
  hooks: {
    readPackage(pkg, context) {
      if (pkg.name === 'better-sqlite3') {
        // 允许 better-sqlite3 的构建脚本运行
        return pkg;
      }
      return pkg;
    },
  },
};
