exports.clearConsole = () => {
  // 判断是否链接到文本终端
  if (process.stdout.isTTY) {
    // 获取终端的行数(终端的高度)
    const blank = '\n'.repeat(process.stdout.rows)
    // 输入终端高度行数的换行
    console.log(blank)
    // 将光标移动到给定的 TTY stream 中的指定位置
    readline.cursorTo(process.stdout, 0, 0)
    // 从光标的当前位置向下清除给定的 TTY 流
    readline.clearScreenDown(process.stdout)
  }
}
