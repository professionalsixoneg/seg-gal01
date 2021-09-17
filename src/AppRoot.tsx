/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense, useState } from 'react';
import "@babylonjs/inspector";
import { Scene, Vector3, HemisphericLight, Color3, CubicEase, EasingFunction, Animation, UniversalCamera, HDRCubeTexture } from '@babylonjs/core';

import SceneComponent from 'babylonjs-hook';
import { SceneLoaderContextProvider } from 'react-babylonjs-loaders';

import './App.css';
import { SceneLoaderFallback } from './SceneLoaderModels';
import BuildingLoaderModels from './components/building/BuildingSceneLoader';
import { MyUniversalCamera } from './UniversalCamera';

import { useCustomEventListener } from 'react-custom-events';

import * as dat from 'dat.gui';

import NarrationOverlay from './components/narration-overlay/NarrationOverlay';

const speed = 45;
const framecount = 200;

interface AppConfigType {
    appScene?: Scene;
    currentSlideIndex: number;
    appCamera?: UniversalCamera;
    animCameraPosition?: any;
    animCameraTarget?: any;

}

const appConfig: AppConfigType = {
    currentSlideIndex: 0,
};

interface GallerySlideType {
    name: string,
    positionKeys: Vector3[],
    targetKeys: Vector3[],
    includeTarget: boolean,
    invertTargetInReverse: boolean,
    frames: number,
}

const gallerySlides: GallerySlideType[] = [

    {
        name: "Slide_1",
        positionKeys: [

        ],
        targetKeys: [

        ],
        includeTarget: true,
        invertTargetInReverse: false,
        frames: 90,
    },

    {
        name: "Slides_2",
        positionKeys: [

            new Vector3(31.20832966308216, 22.196359666772523, 34.289489546701915),

            new Vector3(30.963221314778487, 13.560002446369623, 30.8803897850875),

            new Vector3(26.667668900705614, 13.560000994066005, 12.548040626971702),

            new Vector3(31.634616720956448, 13.559998987824073, -12.776641556938053),

            new Vector3(29.872233394709543, 13.559998391971398, -20.298057305372588),

        ],
        targetKeys: [

            new Vector3(31.000195489641914, 21.967954436282007, 33.40122641080184),

            new Vector3(30.75508714133824, 13.331597215879107, 29.992126649187426),

            new Vector3(26.459534727265368, 13.33159576357549, 11.659777491071626),

            new Vector3(31.4264825475162, 13.331593757333557, -13.664904692838128),

            new Vector3(29.557551693910813, 13.562516867433718, -21.1843243112078),

        ],
        includeTarget: true,
        invertTargetInReverse: true,
        frames: 90,
    },

    {
        name: "Slides_3",
        positionKeys: [

            new Vector3(1.463333034640959, 13.559998645098343, -17.102849724129896),

        ],
        targetKeys: [

            new Vector3(1.3605984554111639, 13.562517120560663, -18.037696982747608),

        ],
        includeTarget: false,
        invertTargetInReverse: false,
        frames: 90,
    },

    {
        name: "Slides_4",
        positionKeys: [

            new Vector3(-21.184894733095284, 13.559998467869805, -19.33999584044646),

        ],
        targetKeys: [

            new Vector3(-21.42708121550712, 13.564397887640109, -20.248745810409698),

        ],
        includeTarget: false,
        invertTargetInReverse: false,
        frames: 90,
    },

    {
        name: "Slides_5",
        positionKeys: [

            new Vector3(-21.184894733095284, 13.559998467869805, -19.33999584044646),

            new Vector3(-21.184894733095284, 13.559998467869805, -19.33999584044646),

            new Vector3(-21.184894733095284, 13.559998467869805, -19.33999584044646),

            new Vector3(-21.184894733095284, 13.559998467869805, -19.33999584044646),

            new Vector3(-29.994065300537404, 13.559999588798448, -5.1905748860356375),

            new Vector3(-31.81347020147742, 13.560001096665053, 13.843142801983197),

            new Vector3(-9.329578844142803, 13.560002522231606, 31.787991476059002),

            new Vector3(19.411541972729275, 13.560002099073978, 26.496495859747835),

        ],
        targetKeys: [

            new Vector3(-21.42708121550712, 13.564397887640109, -20.248745810409698),

            new Vector3(-22.06876777306372, 13.400481811034705, -19.61896366378754),

            new Vector3(-21.71082172310562, 13.4659766230342, -18.566005643169618),

            new Vector3(-21.119369286001277, 13.469720431986872, -18.406156204562212),

            new Vector3(-29.72404864259713, 13.46628966556215, -4.29457847689093),

            new Vector3(-30.999420063504317, 13.472531882726328, 14.305929656982743),

            new Vector3(-8.40899610396019, 13.473469759787793, 31.616120509643945),

            new Vector3(19.639897508780113, 13.531749548836723, 25.58459907978372),

        ],
        includeTarget: true,
        invertTargetInReverse: true,
        frames: 90,
    },
];

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const sos_gallery_slides: GallerySlideType[] = [];

    const options = {
        name: "Slide_1",
        includeTarget: true,
        invertTargetInReverse: false,
        frames: 90,

        positionKeys: [] as Vector3[],
        targetKeys: [] as Vector3[],

        add: function () {
            options.positionKeys.push(appConfig.appCamera!.position.clone());
            options.targetKeys.push(appConfig.appCamera!.target.clone());
        },
        next: function () {
            sos_gallery_slides.push({
                name: options.name,
                positionKeys: options.positionKeys,
                targetKeys: options.targetKeys,
                includeTarget: options.includeTarget,
                invertTargetInReverse: options.invertTargetInReverse,
                frames: options.frames,
            });
            options.name = `Slides_${sos_gallery_slides.length + 1}`;
            options.positionKeys = [];
            options.targetKeys = [];
        },
        copy: function () {
            const json = `
                [
                    ${sos_gallery_slides.map(slide => `
                        {
                            name: "${slide.name}",
                            positionKeys: [
                                ${slide.positionKeys.map(pos => `
                                    new Vector3(${pos.x}, ${pos.y}, ${pos.z}),
                                `).join("")}
                            ],
                            targetKeys: [
                                ${slide.targetKeys.map(tar => `
                                    new Vector3(${tar.x}, ${tar.y}, ${tar.z}),
                                `).join("")}
                            ],
                            includeTarget: ${slide.includeTarget},
                            invertTargetInReverse: ${slide.invertTargetInReverse},
                            frames: ${slide.frames},
                        },
                    `).join("")}
                ]
            `.replaceAll("(?m)^\\s*$[\n\r]{1,}", "");
            navigator.clipboard.writeText(json);
        }
    }

    const gui = new dat.GUI({ name: "sos-gallery-dev" });
    gui.domElement.id = 'dat-gui';
    const slidesFolder = gui.addFolder("Slides");
    slidesFolder.add(options, 'name').name("Slide Name").listen();
    slidesFolder.add(options, 'includeTarget').name("Include Target");
    slidesFolder.add(options, 'invertTargetInReverse').name("Invert Target In Reverse");
    slidesFolder.add(options, 'frames').name("Frames").min(15).max(150);
    slidesFolder.add(options, 'add').name("Add Keys");
    slidesFolder.add(options, 'next').name("Next Slide");
    slidesFolder.add(options, 'copy').name("Copy to Clipboard");
    gui.close();
}

/**
 * Called once when the scene is ready.
 */
const onSceneReady = (scene: Scene) => {

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        scene.debugLayer.show();
    }

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const rootUrl = '/assets/';

    var reflectionTexture = new HDRCubeTexture(rootUrl + "textures/evening_meadow_2k.hdr", scene, 128, false, true, false, true);
    scene.createDefaultSkybox(reflectionTexture, true, 500);

    // Default intensity is 1. Let's dim the light a small amount
    //light.intensity = 0.2;

    scene.getEngine().resize();

    appConfig.appScene = scene;


    var easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    appConfig.animCameraTarget = new Animation("animCameraTarget", "target", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    appConfig.animCameraPosition = new Animation("animCameraPosition", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    // appConfig.animCameraTarget.setEasingFunction(easingFunction);
    // appConfig.animCameraPosition.setEasingFunction(easingFunction);

}

const onNext = () => {

    var nextSlideIndex = (appConfig.currentSlideIndex + 1) % (gallerySlides.length + 1);

    if (nextSlideIndex >= gallerySlides.length) nextSlideIndex = 0;

    console.log(appConfig.currentSlideIndex);
    moveToSlide(gallerySlides[appConfig.currentSlideIndex], false);

    appConfig.currentSlideIndex = nextSlideIndex;

}

const onPrev = () => {

    var previousSlideIndex = (appConfig.currentSlideIndex - 1) % (gallerySlides.length + 1);

    if (previousSlideIndex < 0) previousSlideIndex = gallerySlides.length - 1;

    console.log(appConfig.currentSlideIndex);
    moveToSlide(gallerySlides[previousSlideIndex], true);

    appConfig.currentSlideIndex = previousSlideIndex;

}

const moveToSlide = (slideToDisplay: GallerySlideType, reverse = false, isInitializer = false) => {
    if (appConfig.appScene && appConfig.appCamera && appConfig.appScene.activeCamera && appConfig.appScene.activeCameras) {
        var positionKeys = [
            {
                frame: 0,
                value: appConfig.appCamera.position
            }
        ];
        if (reverse) {
            for (var posIdx = slideToDisplay.positionKeys.length - 1; posIdx >= 0; posIdx--) {
                const pos = slideToDisplay.positionKeys[posIdx];
                positionKeys.push({
                    frame: (slideToDisplay.positionKeys.length - posIdx) / slideToDisplay.positionKeys.length * slideToDisplay.frames,
                    value: pos
                });
            }
        } else {
            slideToDisplay.positionKeys.forEach((pos, idx) => {
                positionKeys.push({
                    frame: (idx + 1) / slideToDisplay.positionKeys.length * slideToDisplay.frames,
                    value: pos
                });
            });
        }
        appConfig.animCameraPosition.setKeys(positionKeys);

        var targetKeys = [
            {
                frame: 0,
                value: appConfig.appCamera.getTarget()
            }
        ];
        if (reverse) {
            for (var tarIdx = slideToDisplay.targetKeys.length - 1; tarIdx >= 0; tarIdx--) {
                const pos = slideToDisplay.positionKeys[tarIdx];
                const tar = slideToDisplay.targetKeys[tarIdx];
                targetKeys.push({
                    frame: (slideToDisplay.targetKeys.length - tarIdx) / slideToDisplay.targetKeys.length * slideToDisplay.frames,
                    value: slideToDisplay.invertTargetInReverse ? pos.add(tar.subtract(pos).scale(-1)) : tar
                });
            }
        } else {
            slideToDisplay.targetKeys.forEach((tar, idx) => {
                targetKeys.push({
                    frame: (idx + 1) / slideToDisplay.targetKeys.length * slideToDisplay.frames,
                    value: tar
                });
            });
        }
        appConfig.animCameraTarget.setKeys(targetKeys);

        appConfig.appCamera.animations = [];
        appConfig.appCamera.animations.push(appConfig.animCameraPosition);
        if (slideToDisplay.includeTarget) appConfig.appCamera.animations.push(appConfig.animCameraTarget);

        appConfig.appCamera.detachControl(appConfig.appScene.getEngine()._workingCanvas);

        appConfig.appScene.beginDirectAnimation(appConfig.appCamera, appConfig.appCamera.animations, 0, slideToDisplay.frames, false, 1, () => {
            if (appConfig.appCamera && appConfig.appScene) {
                if (isInitializer) {
                    (window.document.getElementsByClassName("loading-screen")[0] as any).style.opacity = 0;
                    setTimeout(() => { window.document.getElementsByClassName("loading-screen")[0].remove(); appConfig.currentSlideIndex++ }, 1000);
                }
                if (!slideToDisplay.includeTarget) {
                    appConfig.appCamera.target = reverse ? slideToDisplay.targetKeys[0] : slideToDisplay.targetKeys[slideToDisplay.targetKeys.length - 1];
                }
                appConfig.appCamera.attachControl(appConfig.appScene.getEngine()._workingCanvas, true);
                appConfig.appCamera.lockedTarget = null;
            }
        });
    }
}

const animateCameraTargetToPosition = function (cam: UniversalCamera, speed: number, frameCount: number, newPos: Vector3) {
    var ease = new CubicEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const aable1 = Animation.CreateAndStartAnimation('at5', cam, 'target', speed, frameCount, cam.getTarget(), newPos, 0, ease);
    if (aable1) {
        aable1.disposeOnEnd = true;
    }

}

const animateCameraToPosition = function (cam: UniversalCamera, speed: number, frameCount: number, newPos: Vector3) {
    var ease = new CubicEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const aable2 = Animation.CreateAndStartAnimation('at4', cam, 'position', speed, frameCount, cam.position, newPos, 0, ease);
    if (aable2) {
        aable2.disposeOnEnd = true;
    }
}


const sceneLoaderPosition = new Vector3(0, 1.5, 0);

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {


    useCustomEventListener('camera-ready', data => {
        appConfig.appCamera = data as UniversalCamera;
        if (appConfig.appScene && appConfig.appScene.activeCamera && appConfig.appScene.activeCameras) {
            if (appConfig.appCamera) {
                //animateCameraToPosition(appConfig.appCamera, speed, framecount, new Vector3(25.30, 15.57, 31.84));
                appConfig.currentSlideIndex = 0;
                var slideToDisplay = gallerySlides[appConfig.currentSlideIndex];
                moveToSlide(slideToDisplay, false, true);
            }
        }
    });

    const [xyPosition, setXyPosition] = useState(8);
    // TODO: put button on @babylonjs/gui full screen
    return (
        <>
            <div id="canvas-wrapper">
                <div className="slide-show-controls slide-show-controls-prev">
                    <button onClick={onPrev}>Prev</button>
                </div>
                <div className="slide-show-controls slide-show-controls-next">
                    <button onClick={onNext}>Next</button>
                </div>
                <div className="loading-screen"
                    style={{
                        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 99999, backgroundColor: "#fff",
                        transition: "opacity  1000ms linear"
                    }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                        <img src="/assets/images/loading.gif" alt="loading assets"></img>
                        <div style={{ marginTop: "-80px", textAlign: "center", fontSize: "28px", fontFamily: "arial" }}>
                            Enjoy your Simran while the gallery loads...
                        </div>
                    </div>
                </div>
                <SceneComponent antialias onSceneReady={onSceneReady} id='my-canvas' renderChildrenWhenReady>
                    <MyUniversalCamera radius={xyPosition + 2} />
                    <SceneLoaderContextProvider>
                        <Suspense fallback={<SceneLoaderFallback position={sceneLoaderPosition} width={2} height={0.5} depth={0.2} barColor={Color3.Red()} />}>
                            <BuildingLoaderModels position={sceneLoaderPosition} />
                        </Suspense>
                    </SceneLoaderContextProvider>
                </SceneComponent>
            </div>
        </>
    )
}
