App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    fileHash: '',

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined'){
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }else {
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function () {
        $.getJSON("SaveEvidence.json", function (saveEvidence) {
            App.contracts.SaveEvidence = TruffleContract(saveEvidence);
            App.contracts.SaveEvidence.setProvider(App.web3Provider);
            App.render();
            //TODO 监听函数
            // App.listenForEvent();
        });
    },

    render: function () {
        console.log("render()方法正在执行");
        var saveEvidence;

        // debugger;
        var upload = $("#upload");
        var download = $("#download");
        var fileInfo = $("#fileInfo");

        upload.show();
        download.show();
        // fileInfo.hide();
        fileInfo.show();

        web3.eth.getCoinbase(function (err, account) {
            if (err === null){
                App.account = account;
                $("#accountAddress").html("当前账户:"+account);
                console.log("当前账户:"+account);
            }
        });
    },

    getFileInfo: function (fileHash) {
        App.contracts.SaveEvidence.deployed().then(function (instance) {
            console.log("geiFileInfo()正在获取合约实例");
            return instance.getFile(fileHash, {from: App.account});
        }).then(function (file) {
            console.log("合约实例返回文件对象:",file);
            var statusCode = file[0];
            var extMsg = file[1];
            console.log(statusCode);
            if(statusCode !=0) {
                alert(extMsg);
            }
            var fileName = file[2];
            var fileHash = file[3];
            var filePath = file[4];
            var fileSize = file[5];
            var fileUploadTime = file[6];
            $("#fileName").html(fileName);
            $("#fileHash").html(fileHash);
            $("#filePath").html(filePath);
            $("#fileSize").html(fileSize);
            $("#fileUploadTime").html(fileUploadTime);
        }).catch(function (error) {
            console.warn(error.message);
        });
    },

    saveFileInfo: function (fileName, fileHash, filePath, fileSize, fileUploadTime) {
        App.contracts.SaveEvidence.deployed().then(function (instance) {
            App.fileHash = fileHash;
            return instance.saveFile(fileName, fileHash, filePath, fileSize, fileUploadTime, {from: App.account});
        }).then(function (result) {
            App.listenForEvent();
        }).catch(function (error) {
            console.warn(error.message);
        })
    },

    listenForEvent: function () {
        App.contracts.SaveEvidence.deployed().then(function (instance) {
            console.log("开始监听事件");
            instance.saveFileEvent({},{
                fromBlock: 'latest',
                toBlock: 'latest'
            }).watch(function (error,event) {
                console.log("event:",event);
                console.log("App.fileHash:", App.fileHash);
                App.getFileInfo(App.fileHash);
            })
        })
    }
};

function download(){
    console.log("下载函数");
    var fileHash = $("#fileHashInput").val();
    console.log("文件Hash:"+fileHash);
    App.fileHash = fileHash;
    App.getFileInfo(fileHash);
    var fileName = $("#fileName").val();
    var filePath = $("#filePath").val();

    $.ajax({
        url: "http://localhost:80/file/download",
        type: "POST",
        data: {"fileName":fileName, "filePath":filePath},
        xhrFields: {responseType: 'blob'},
        success: function(result){
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = fileName;
            document.body.append(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
        error: function(msg){
            console.error(msg);
        }
    })
};

function upload(){
    console.log("上传函数");
    var file = $("#uploadInput")[0].files[0];
    var formData = new FormData();
    formData.append("file", file);

    $.ajax({
    	url: "http://localhost:80/file/upload",
        type: "POST",
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function(result){
        	if (result.status === 0) {
                App.saveFileInfo(result.data.fileName, result.data.fileHash, result.data.filePath, result.data.fileSize,  result.data.fileUploadTime);
            }else{
                alert("服务器繁忙，请稍后重试！");
            }
        },
         error: function(msg){
            console.error(msg);
        }

    })
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
