import { Axis, PointerEventTypes, Scene, UniversalCamera, Vector3 } from '@babylonjs/core';
import { useCamera } from 'babylonjs-hook';
import React from 'react';
import { emitCustomEvent } from 'react-custom-events';

type CameraPosition = {
    radius: number
}
export const MyUniversalCamera: React.FC<CameraPosition> = ({ radius }) => {
    useCamera<UniversalCamera>((scene: Scene) => {
        console.log('creating camera...');
        const universalCamera = new UniversalCamera('camera1', new Vector3(31.20832966308216, 22.196359666772523, 34.289489546701915), scene);
        universalCamera.checkCollisions = true;
        universalCamera.applyGravity = true;
        universalCamera.ellipsoid = new Vector3(5, 6, 5);
        universalCamera.setTarget(new Vector3(30.667263412309627, 21.972823394806266, 33.553433198881265));
        universalCamera.cameraRotation.addVector3(new Vector3(3.67, -135.43, 0.00));
        emitCustomEvent('camera-ready', universalCamera);

        // wingnut crap.
        scene.onPrePointerObservable.add(function (pointerInfo, eventState) {
            //console.log(pointerInfo);
            var event = pointerInfo.event;
            var delta = 0;
            if ((event as any).deltaY) {
                delta = -(event as any).deltaY;
            }
            else if (event.detail) {
                delta = event.detail;
            }
            if (delta && scene.activeCamera) {
                //console.log(delta);
                var dir = scene.activeCamera.getDirection(Axis.Z);

                //console.log("dir: ", dir);
                //scene.activeCamera.position.z += delta/10;
                if (delta > 0)
                    universalCamera.cameraDirection.addInPlace(dir);
                else
                    universalCamera.cameraDirection.subtractInPlace(dir);

            }
        }, PointerEventTypes.POINTERWHEEL, false);

        scene.registerBeforeRender(function () {
            if (universalCamera.rotation.x < -0.3) {
                universalCamera.rotation.x = -0.3;
            }
            if (universalCamera.rotation.x > 0.3) {
                universalCamera.rotation.x = 0.3;
            }
        })

        return universalCamera;
    })
    return null;
}