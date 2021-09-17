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
    frames: number,
}

const gallerySlides: GallerySlideType[] =
    [
        {
            name: "Slide_0",
            positionKeys: [],
            targetKeys: [],
            frames: 0,
        },
        {
            name: "Slide_1",
            positionKeys: [

                new Vector3(31.787974891983552, 13.560002520686336, 31.818485616555773),

                new Vector3(30.766321531887264, 13.560001479502514, 18.675679148816908),

                new Vector3(25.83719929448477, 13.560000154758793, 1.95351161077264),

                new Vector3(20.12521722025641, 13.559999401441203, -7.555575133097766),

                new Vector3(2.969841846687551, 13.559997877429744, -26.79308844975219),

                new Vector3(-16.959935424943854, 13.559997573101791, -30.634603555380735),

            ],
            targetKeys: [

                new Vector3(31.478452731951048, 13.46494612019149, 30.935501829572257),

                new Vector3(30.697225710628846, 13.466504651929037, 17.742413783486903),

                new Vector3(25.571464241097978, 13.466815262790925, 1.056181350534066),

                new Vector3(19.639741236185948, 13.467126466100282, -8.355692477040382),

                new Vector3(2.281935721884115, 13.462758516293038, -27.42698885631495),

                new Vector3(-17.65493672714696, 13.492503556628861, -31.264617761562604),

            ],
            frames: 90,
        },
    ];

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const sos_gallery_slides: GallerySlideType[] = [];

    const options = {
        name: "Slide_1",
        includePosition: true,
        includeTarget: true,
        frames: 90,

        positionKeys: [] as Vector3[],
        targetKeys: [] as Vector3[],
        lastPosition: new Vector3(),
        lastTarget: new Vector3(),

        add: function () {
            options.positionKeys.push(
                options.includePosition
                    ? appConfig.appCamera!.position.clone()
                    : options.lastPosition.clone()
            );
            options.targetKeys.push(
                options.includeTarget
                    ? appConfig.appCamera!.target.clone()
                    : options.lastTarget.clone()
            );
            options.lastPosition = options.positionKeys[options.positionKeys.length - 1];
            options.lastTarget = options.targetKeys[options.targetKeys.length - 1];
        },
        next: function () {
            sos_gallery_slides.push({
                name: options.name,
                positionKeys: options.positionKeys,
                targetKeys: options.targetKeys,
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
                            frames: ${slide.frames},
                        },
                    `).join("")}
                ]
            `;
            json.replaceAll(/(^[ \t]*\n)/gm, "");
            navigator.clipboard.writeText(json);
        }
    }

    const gui = new dat.GUI({ name: "sos-gallery-dev" });
    gui.domElement.id = 'dat-gui';
    const slidesFolder = gui.addFolder("Slides");
    slidesFolder.add(options, 'name').name("Slide Name").listen();
    slidesFolder.add(options, 'includePosition').name("Include Postion");
    slidesFolder.add(options, 'includeTarget').name("Include Target");
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

    const nextSlideIndex = (appConfig.currentSlideIndex + 1) % (gallerySlides.length + 1);

    console.log(appConfig.currentSlideIndex);
    moveToSlide(gallerySlides[appConfig.currentSlideIndex], false);

    appConfig.currentSlideIndex = nextSlideIndex;

}

const onPrev = () => {

    let previousSlideIndex = (appConfig.currentSlideIndex + gallerySlides.length) % (gallerySlides.length + 1);

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
                const tar = slideToDisplay.targetKeys[tarIdx];
                targetKeys.push({
                    frame: (slideToDisplay.targetKeys.length - tarIdx) / slideToDisplay.targetKeys.length * slideToDisplay.frames,
                    value: tar.clone().scale(-1)
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
        appConfig.appCamera.animations.push(appConfig.animCameraTarget);

        appConfig.appCamera.detachControl(appConfig.appScene.getEngine()._workingCanvas);

        appConfig.appScene.beginDirectAnimation(appConfig.appCamera, appConfig.appCamera.animations, 0, slideToDisplay.frames, false, 1, () => {
            if (appConfig.appCamera && appConfig.appScene) {
                if (isInitializer) {
                    (window.document.getElementsByClassName("loading-screen")[0] as any).style.opacity = 0;
                    setTimeout(() => { window.document.getElementsByClassName("loading-screen")[0].remove(); appConfig.currentSlideIndex++ }, 1000);
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
