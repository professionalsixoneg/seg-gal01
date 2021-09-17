import React, { } from 'react';

import { LoaderStatus, useSceneLoader } from 'react-babylonjs-loaders';
import { PBRMaterial, Vector3 } from '@babylonjs/core';

type BuildingLoaderModelProps = {
    position: Vector3
}

const BuildingLoaderModels: React.FC<BuildingLoaderModelProps> = ({ position }) => {
    const rootUrl = '/assets/models/entry-hall/';
    /*const loadedWaterBottle = */ useSceneLoader(rootUrl, 'entry-hall.gltf', undefined, {
        reportProgress: true,
        scaleToDimension: 250,
        onModelLoaded: (loadedModel) => {
            if (loadedModel.status === LoaderStatus.Loaded) {
                console.log('Model Loaded:', position, loadedModel);
                loadedModel.rootMesh!.position = position;

                // for sos-gallery-with-images
                loadedModel.rootMesh!.getScene().getNodeByID("Room")?.getChildMeshes().forEach((thisMesh) => {
                    if (thisMesh.name.indexOf("GrayBench") === -1) {
                        thisMesh.checkCollisions = true
                    }
                });

                // for room-vr-gallery
                loadedModel.rootMesh!.getScene().getNodeByID("floor")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("beams")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("celling")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("frames")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("walls")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("walls_interior")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                loadedModel.rootMesh!.getScene().getNodeByID("stairs")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });
                //loadedModel.rootMesh!.getScene().getNodeByID("glass")?.getChildMeshes().forEach((thisMesh) => { thisMesh.checkCollisions = true });

                ["001_Spreading_Joy_Peace_Through_Meditation",
                    "002_World_Tours",
                    "003_Worldwide_Centers",
                    "004_Humanitarian_Work",
                    "005_Books_Media",
                    "006_Selfless_Service_Charitable",
                    "007_Meditation_for_Physical_Mental_Spiritual_Health",
                    "EntryHallSignage",
                    "R-19"].forEach((eachMaterial) => {
                        var imageMaterial = loadedModel.rootMesh!.getScene().getMaterialByID(eachMaterial) as any;
                        if (imageMaterial) {
                            imageMaterial._environmentIntensity = 0;
                            imageMaterial._specularIntensity = 0;
                            imageMaterial._directIntensity = 0;
                        }
                    });



            } else {
                console.log('Model not loaded', loadedModel);
            }
        }
    });

    return null;
}

export default BuildingLoaderModels;