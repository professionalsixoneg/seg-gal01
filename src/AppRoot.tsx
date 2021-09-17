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
    currentSlideIndex?: number;
    appCamera?: UniversalCamera;
    animCameraPosition?: any;
    animCameraTarget?: any;

}

const appConfig: AppConfigType = {};

interface GallerySlideType {
    name?: string,
    slideCameraTarget: Vector3,
    slideCameraPosition: Vector3,
    animationSpeed?: number,
    animationFrameCount?: number,
    positionOnly?: boolean,
    autoNext?: boolean,
    isInitializer?: boolean
}

const gallerySlides: GallerySlideType[] = [

    {
        name: "Slide_0",
        slideCameraPosition: new Vector3(31.20832966308216, 22.196359666772523, 34.289489546701915),
        slideCameraTarget: new Vector3(30.667263412309627, 21.972823394806266, 33.553433198881265),
        isInitializer: true,
    },
    {
        name: "Landing_Position",
        slideCameraPosition: new Vector3(14.5384268322535, 13.560000783879708, 9.894870518821271),
        slideCameraTarget: new Vector3(14.222325359736375, 13.495514353290124, 10.778285155395782),
    },
    {
        name: "Slides_2",
        slideCameraPosition: new Vector3(-16.266625726645987, 13.56000164319088, 20.741908444126178),
        slideCameraTarget: new Vector3(-17.206784852996773, 13.542896569858412, 20.72434852514045),
    },

    {
        name: "Slides_3",
        slideCameraPosition: new Vector3(-16.20365907606718, 13.559999160935625, -10.591463891483988),
        slideCameraTarget: new Vector3(-17.143818202417965, 13.542894087603157, -10.609023810469719),
        positionOnly: true,
    },

    {
        name: "Slides_4",
        slideCameraPosition: new Vector3(-22.604083701249927, 13.55999875785718, -15.679501083521078),
        slideCameraTarget: new Vector3(-22.569189327617295, 13.547254485342998, -16.61924578124054),
    },

    {
        name: "Slides_5",
        slideCameraPosition: new Vector3(-2.8820644439476997, 13.559998813941293, -14.97155440821931),
        slideCameraTarget: new Vector3(-2.8471700703150695, 13.547254541427112, -15.91129910593877),
        positionOnly: true,
    },

    {
        name: "Slides_6",
        slideCameraPosition: new Vector3(18.772028054177543, 13.559998877636025, -14.167539276609663),
        slideCameraTarget: new Vector3(18.806922427810175, 13.547254605121843, -15.107283974329123),
        positionOnly: true,
    },

    {
        name: "Slides_7",
        slideCameraPosition: new Vector3(16.837856957341327, 13.559998452754428, -19.53079643463817),
        slideCameraTarget: new Vector3(17.7780599201847, 13.549605198570926, -19.510536177899123),
    },

    {
        name: "Slides_8",
        slideCameraPosition: new Vector3(16.07274462336508, 13.560001358272869, 17.145403954314457),
        slideCameraTarget: new Vector3(17.01294758620845, 13.549608104089367, 17.165664211053503),
        positionOnly: true,
    },

];


/**
 * Called once when the scene is ready.
 */
const onSceneReady = (scene: Scene) => {

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
    appConfig.animCameraTarget.setEasingFunction(easingFunction);
    appConfig.animCameraPosition.setEasingFunction(easingFunction);


}

const onNext = () => {

    const slideToDisplayIndex = ((appConfig.currentSlideIndex ?? 0) + 1) % gallerySlides.length;

    const slideToDisplay = gallerySlides[slideToDisplayIndex];

    moveToSlide(slideToDisplay, slideToDisplay.positionOnly ?? false);

    appConfig.currentSlideIndex = slideToDisplayIndex;

}

const onPrev = () => {

    let previousSlideIndex = ((appConfig.currentSlideIndex ?? 0) - 1) % gallerySlides.length;

    if (previousSlideIndex < 0) previousSlideIndex = 0;

    const slideToDisplay = gallerySlides[previousSlideIndex];

    moveToSlide(slideToDisplay, gallerySlides[appConfig.currentSlideIndex ?? 0].positionOnly ?? false);

    appConfig.currentSlideIndex = previousSlideIndex;

}

const moveToSlide = (slideToDisplay: GallerySlideType, positionOnly: boolean) => {
    if (appConfig.appScene && appConfig.appScene.activeCamera && appConfig.appScene.activeCameras) {
        if (appConfig.appCamera) {


            var positionKeys = [{
                frame: 0,
                value: appConfig.appCamera.position
            },
            //At the animation key 100, the value of scaling is "1"
            {
                frame: 100,
                value: slideToDisplay.slideCameraPosition
            }];

            appConfig.animCameraPosition.setKeys(positionKeys);

            var targetKeys = [{
                frame: 0,
                value: appConfig.appCamera.getTarget()
            }, {
                frame: 100,
                value: slideToDisplay.slideCameraTarget
            }];

            appConfig.animCameraTarget.setKeys(targetKeys);

            appConfig.appCamera.animations = [];


            appConfig.appCamera.animations.push(appConfig.animCameraPosition);
            if (!positionOnly) appConfig.appCamera.animations.push(appConfig.animCameraTarget);
            appConfig.appCamera.detachControl(appConfig.appScene.getEngine()._workingCanvas);

            appConfig.appScene.beginDirectAnimation(appConfig.appCamera, appConfig.appCamera.animations, 0, 360, false, 1, () => {
                if (appConfig.appCamera && appConfig.appScene) {
                    if (slideToDisplay.isInitializer) {
                        (window.document.getElementsByClassName("loading-screen")[0] as any).style.opacity = 0;
                        setTimeout(() => { window.document.getElementsByClassName("loading-screen")[0].remove(); onNext(); }, 1000);
                        slideToDisplay.isInitializer = false;
                    }
                    if (positionOnly) {
                        appConfig.appCamera.target = slideToDisplay.slideCameraTarget;
                    }
                    appConfig.appCamera.attachControl(appConfig.appScene.getEngine()._workingCanvas, true);
                    appConfig.appCamera.lockedTarget = null;
                    if (slideToDisplay.autoNext) onNext();
                }
            });

        }


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
                moveToSlide(slideToDisplay, slideToDisplay.positionOnly ?? false);
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
