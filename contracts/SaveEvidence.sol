pragma solidity >=0.4.22 <0.8.0;

/*
 * 存证智能合约
 * @author 王伟强
 * @version 1.0.0
 * @date 2020/09/19
*/
contract SaveEvidence {
    address public admin = msg.sender;
    //状态码
    uint CODE_SUCCESS = 0;
    uint USER_NOT_EXIST = 1;
    uint FILE_NOT_EXIST = 2;
    uint FILE_ALREADY_EXIST = 3;

    struct File{
        uint fileId;
        string fileName;
        string fileHash;
        string filePath;
        string fileSize;
        string fileUploadTime;
    }

    struct User{
        uint userId;
        address userAddr;
        //文件Hash => File
        mapping(string => File) userFileMap;
    }

    uint public userCount = 0;
    uint public fileCount = 0;

    //文件Hash => File
    mapping (string => File) fileHashMap;

    //用户address => User
    mapping (address => User) userMap;

    //存储文件事件
    event saveFileEvent(string fileName, string fileHash, string filePath, string fileSize, string fileUploadTime);

    /**
     * @param fileHash 文件Hash
     * @return statusCode 文件状态码
     * @return extMsg 扩展信息
    */
    function saveFile(string memory fileName, string memory fileHash, string memory filePath, string memory fileSize, string memory fileUploadTime) public returns(uint statusCode, string memory extMsg){
        emit saveFileEvent(fileName, fileHash, filePath, fileSize, fileUploadTime);
        //判断是否已经存在该用户
        User storage user = userMap[msg.sender];
        if(user.userAddr == address(0) ){
            user.userId =  ++userCount;
            user.userAddr = msg.sender;
            userMap[msg.sender] = user;
        }

        File storage file = user.userFileMap[fileHash];
        if( bytes(file.fileHash).length != 0 ){
            return (FILE_ALREADY_EXIST,"文件已存在");
        }
        file.fileId = ++fileCount;
        file.fileName = fileName;
        file.fileHash = fileHash;
        file.filePath = filePath;
        file.fileSize = fileSize;
        file.fileUploadTime = fileUploadTime;
        user.userFileMap[fileHash] = file;
        fileHashMap[fileHash] = file;
        return (CODE_SUCCESS,"文件上传成功");
    }

    function getFile(string memory _fileHash) view public returns (uint statusCode, string memory extMsg, string memory fileName, string memory fileHash, string memory filePath, string memory fileSize, string memory fileUploadTime){
        File storage file = fileHashMap[_fileHash];
        if( bytes(file.fileHash).length == 0 ){
            return (FILE_NOT_EXIST, "文件不存在","","","","","");
        }
        return (CODE_SUCCESS, "文件存在", file.fileName, file.fileHash, file.filePath, file.fileSize, file.fileUploadTime);
    }
}