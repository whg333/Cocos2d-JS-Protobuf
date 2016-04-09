var HttpProtobufScene = cc.Scene.extend({
    onEnter:function(){
        this._super();

        var layerGradient = new cc.LayerGradient(cc.color(255, 0, 0), cc.color(0, 0, 255));
        this.addChild(layerGradient, 0);

        this.addChild(new HttpProtobufLayer());
    }
});

var HttpProtobufLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        this.postSendProtobuf();
        return true;
    },

    postSendProtobuf:function(){
        var winSize = cc.winSize;

        var statusGetLabel = new cc.LabelTTF('Status:', 'Thonburi', 25);
        this.addChild(statusGetLabel, 1);
        statusGetLabel.x = winSize.width / 2;
        statusGetLabel.y = winSize.height - 100;
        statusGetLabel.setString('Status: Send Post Request to "http://localhost:3000/proto"');

        var xhr = cc.loader.getXMLHttpRequest();
        //set arguments with <URL>?xxx=xxx&yyy=yyy
        //xhr.open('GET', 'http://192.168.80.83:8077/huaTeng/userController/getUserInfo.ht?requestInfoStr={\'openid\':\'whg333\'}', true);

        xhr.open('POST', 'http://localhost:3000/proto');

        //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        //xhr.setRequestHeader('ht_auth_secret','003964663fccb7d9_404883');
        //xhr.setRequestHeader('ht_idf_c_key','');

        //set Content-type 'text/plain;charset=UTF-8' to post plain text
        //xhr.setRequestHeader('Content-Type','text/plain;charset=UTF-8');

        //这个在用POST请求时需要指定以表单形式提交参数
        //xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
        xhr.setRequestHeader('Content-Type','application/x-protobuf');

        //这个代表服务器返回的protobuf协议的数据
        //对应的spring mvc controller方法返回ResponseEntity<TestProto>且使用ResponseEntity.ok(testProto)
        xhr.setRequestHeader('Accept','application/x-protobuf');

        //xhr.responseType = 'blob';
        if (xhr.overrideMimeType){
            //这个是必须的，否则返回的是字符串，导致protobuf解码错误
            //具体见http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }

        var ProtoBuf = dcodeIO.ProtoBuf,
            TestProtobuf = ProtoBuf.loadProtoFile('../protobuf/TestProtobuf.proto').build('TestProtobuf'),
            TestProto = TestProtobuf.TestProto;

        var self = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var httpStatus = xhr.statusText;
                statusGetLabel.setString('Status: Got POST response! ' + httpStatus);

                var response = 'POST Response: \n\n';
                var data = xhr.responseText;
                //trace(data+' !');
                //trace(typeof data);
                response += 'xhr.responseText = '+data+'\n\n';

                var protobufResp = TestProto.decode(str2bytes(data));
                var protobuf2JsonResp = JSON.stringify(protobufResp);
                trace(protobuf2JsonResp);
                response += 'protobuf2JsonResp = '+protobuf2JsonResp+'\n\n';

                trace(protobufResp.id);
                response += 'id = '+protobufResp.id+'\n';
                trace(protobufResp.name);
                response += 'name = '+protobufResp.name+'\n';

                var responseLabel = new cc.LabelTTF(response, 'Thonburi', 20);
                self.addChild(responseLabel, 1);
                responseLabel.anchorX = 0;
                responseLabel.anchorY = 1;
                responseLabel.textAlign = cc.TEXT_ALIGNMENT_LEFT;

                responseLabel.x = 10;
                responseLabel.y = winSize.height / 1.5;
            }
        };

        //var data = {
        //    userIdStr:'1234'
        //};

        //var data = 'userName=测试123qwer&userId=100123';
        //trace(data);

        //xhr.send();
        //xhr.send(requestParam(data));

        var testProto = new TestProto({
            id:10014,
            name:'testProtoName测试987'
        });
        xhr.send(testProto.toBuffer());
    }

});

function requestParam(data){
    if(typeof(data) == 'string'){
        return data;
    }
    var result = [];
    for(e in data){
        result.push(e+'='+data[e]);
    }
    return result.join('&');
}

function trace(){
    cc.log(Array.prototype.join.call(arguments, ', '));
}

function isJson(obj){
    var result = typeof(obj) == 'object'
        && Object.prototype.toString.call(obj).toLowerCase() == '[object object]'
        && !obj.length;
    return result;
}

function str2bytes(str){
    var bytes = [];
    for (var i = 0, len = str.length; i < len; ++i) {
        var c = str.charCodeAt(i);
        var byte = c & 0xff;
        bytes.push(byte);
    }
    return bytes;
}