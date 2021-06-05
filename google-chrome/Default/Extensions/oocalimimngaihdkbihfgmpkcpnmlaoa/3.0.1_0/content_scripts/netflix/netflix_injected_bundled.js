(() => {
    window.seekScriptLoaded = !0;
    var getVideoPlayer = function() {
        var e = window.netflix.appContext.state.playerApp.getAPI().videoPlayer, t = e.getAllPlayerSessionIds()[0];
        return e.getVideoPlayerBySessionId(t);
    };
    window.addEventListener("message", (function seekInteraction(e) {
        if (e.source == window) if (e.data.type && "SEEK" == e.data.type) getVideoPlayer().seek(e.data.time); else if (e.data.type && "IsPaused" === e.data.type) {
            const paused = getVideoPlayer().isPaused();
            var evt = new CustomEvent("FromNode", {
                detail: {
                    type: "IsPaused",
                    paused,
                    updatedAt: Date.now()
                }
            });
            window.dispatchEvent(evt);
        } else e.data.type && "teardown" == e.data.type ? (window.removeEventListener("message", seekInteraction, !1), 
        window.seekScriptLoaded = !1) : e.data.type && "NEXT_EPISODE" == e.data.type && function() {
            var controlsRoot = document.querySelector(".PlayerControlsNeo__button-control-row");
            if (null == controlsRoot) return null;
            for (var keys = Object.keys(controlsRoot), key = null, i = 0; i < keys.length; i++) if (keys[i].startsWith("__reactInternalInstance")) {
                key = keys[i];
                break;
            }
            for (var node = controlsRoot[key].child; node.sibling; ) {
                if ("play" == node.key) return node;
                node = node.sibling;
            }
            return null;
        }().stateNode.props.player._coreComponent.props.playNextTitle({
            videoId: parseInt(e.data.videoId)
        });
    }), !1);
})();