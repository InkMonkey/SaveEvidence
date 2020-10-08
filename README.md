# SaveEvidence

项目为简单的存证智能合约，采用了官方提供的Pet Shop Truffle Box。本程序与[filemanage](https://github.com/InkMonkey/filemanage)搭配使用。

宠物商店框架相关教程可参考[Pet Shop Truffle Box](https://github.com/truffle-box/pet-shop-box)。

###本地部署

1.编译智能合约。

```javascript
    truffle compile
```

2.打开[Ganache](https://github.com/truffle-box/pet-shop-box),点击`QUICKSTART`初始化私有链。

3.迁移智能合约。

```javascript
    truffle migrate
```

4.运行liteserver服务器。

```javascript
    npm run dev
```
5.在浏览器中使用MetaMask插件连接私有链并访问程序首页。
