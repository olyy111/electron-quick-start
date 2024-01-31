const {
    createAgoraRtcEngine,
    VideoMirrorModeType,
    VideoSourceType,
    RenderModeType,
    ChannelProfileType,
    ClientRoleType,
    AudienceLatencyLevelType,
    } = require("agora-electron-sdk");

let rtcEngine;
let localVideoContainer;
let remoteVideoContainer;
let isJoined = false;
// 填入你的 App ID
const APPID = "8954b25852ef4994a275b3c8e87684b2";
// 填入你的临时 Token
let token = "007eJxTYCgszz34MLRi9abyvf188a0NUye//3CVrWQKsxfPk893WksVGCwsTU2SjEwtTI1S00wsLU0SjcxNk4yTLVItzM0sgDLt/PNSGwIZGVofsjAzMkAgiM/CUJJaXMLAAACoryAZ";
// 填入生成 Token 时使用的频道名
const channel = "test";
// 用户 ID，并确保其在频道内的唯一性
let uid = 123;

const EventHandles = {
    // 监听本地用户加入频道事件
    onJoinChannelSuccess: ({ channelId, localUid }, elapsed) => {
        console.log('成功加入频道：' + channelId);
        isJoined = true;
        // 本地用户加入频道后，设置本地视频窗口
        rtcEngine.setupLocalVideo({
            sourceType: VideoSourceType.VideoSourceCameraPrimary,
            view: localVideoContainer,
            mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
            renderMode: RenderModeType.RenderModeFit,
        });
    },

    // 监听用户离开频道事件
    onLeaveChannel: ({ channelId, localUid }, stats) => {
        console.log('成功退出频道：' + channelId);
        isJoined = false;
    },

    // 监听远端用户加入频道事件
    onUserJoined: ({ channelId, localUid }, remoteUid, elapsed) => {
        console.log('远端用户 ' + remoteUid + ' 已加入');
        // 远端用户加入频道后，设置远端视频窗口
        rtcEngine.setupRemoteVideoEx(
            {
                sourceType: VideoSourceType.VideoSourceRemote,
                uid: remoteUid,
                view: remoteVideoContainer,
                mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
                renderMode: RenderModeType.RenderModeFit,
            },
            { channelId },
        );
    },
};


window.onload = () => {
    const os = require("os");
    const path = require("path");
    localVideoContainer = document.getElementById("join-channel-local-video");
    remoteVideoContainer = document.getElementById("join-channel-remote-video");
    const sdkLogPath = path.resolve(os.homedir(), "./test.log");

    // 创建 RtcEngine 实例
    rtcEngine = createAgoraRtcEngine();

    // 初始化 RtcEngine 实例
    rtcEngine.initialize({
        appId: APPID,
        logConfig: { filePath: sdkLogPath }
    });

    // 注册事件回调
    rtcEngine.registerEventHandler(EventHandles);

    // 设置频道场景为直播场景
    rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);

    // 设置用户角色，主播设为 ClientRoleBroadcaster，观众设为 ClientRoleAudience
    rtcEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    // 视频默认禁用，你需要调用 enableVideo 启用视频流
    rtcEngine.enableVideo();

    // 开启摄像头预览
    rtcEngine.startPreview();

    // 使用临时 Token 加入频道
    rtcEngine.joinChannel(token, channel, uid);
};
