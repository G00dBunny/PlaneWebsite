import { Line, Float, OrbitControls, useScroll, PerspectiveCamera, Text } from '@react-three/drei'
import { Background } from './background.jsx'
import { DogPlane } from './DogPlane.jsx'
import {  useMemo, useRef } from 'react'
import * as THREE from "three"
import { useFrame } from '@react-three/fiber'

const LINE_NB_POINTS = 1000
const CURVE_DISTANCE = 250
const CURVE_AHEAD_CAMERA = 0.008
const CURVE_AHEAD_AIRPLANE = 0.02
const AIRPLANE_MAX_ANGLE = 35


export default function Experience()
{
    const curve = useMemo(() =>
    {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -CURVE_DISTANCE),
            new THREE.Vector3(100, 0, -2 * CURVE_DISTANCE),
            new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
            new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -5 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -6 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -7 * CURVE_DISTANCE),


        ],
        false,
        "catmullrom",
        0.5)
    }, [])

    const linePoints = useMemo ( () =>{
        return curve.getPoints(LINE_NB_POINTS)

    }, [curve])

    const shape = useMemo(() =>
    {
        const shape = new THREE.Shape()
        shape.moveTo(0, -0.08) ;
        shape.lineTo(0, 0.08)

        return shape
    }, [curve])

    const cameraGroup = useRef()
    const scroll = useScroll()

    useFrame((_state, delta) =>{
        // const curPointIndex = Math.min(
        //     Math.round(scroll.offset * linePoints.length),
        //     linePoints.length - 1
        // )

        const scrollOffset = Math.max(0, scroll.offset)

        const curPoint = curve.getPoint(scrollOffset)

        /**
         * Follow the curve points
         */

        cameraGroup.current.position.lerp(curPoint, delta *20)


        // Make the group look ahead on the curve

        const lookAtPoint = curve.getPoint(
            Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1)
        )

        const currentLookAt = cameraGroup.current.getWorldDirection(
            new THREE.Vector3()
        )
        const targetLookAt = new THREE.Vector3().subVectors(curPoint, lookAtPoint).normalize()

        const lookAt = currentLookAt.lerp(targetLookAt, delta * 24)
        cameraGroup.current.lookAt(
            cameraGroup.current.position.clone().add(lookAt)
        )

        /**
         * OLD CALCULATION FOR ROTATION CAMERA AND PLANE DID NOT WORK
         */

        // const xDisplacement = (pointAhead.x - curPoint.x) * 80

        // //Math.PI / 2 -> LEFT
        // //-Math.PI / 2 -> RIGHT
       
        // const angleRotation = (xDisplacement < 0 ? 1 : -1) *  Math.min(Math.abs(xDisplacement), Math.PI / 3)
        
        // const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
        //     new THREE.Euler(
        //         airplane.current.rotation.x,
        //         airplane.current.rotation.y,
        //         angleRotation,
        //     )
        // )

        // const targetCameraQuaternion = new THREE.Quaternion().setFromEuler(
        //     new THREE.Euler(
        //         cameraGroup.current.rotation.x,
        //         angleRotation,
        //         cameraGroup.current.rotation.z,
        //     )
        // )

        // airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2)
        // cameraGroup.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2)

        
        /**
         * DOGGYPLANE ROTATION
         */

        const tangent = curve.getTangent(scrollOffset + CURVE_AHEAD_AIRPLANE)

        const nonLerpLookAt = new THREE.Group()
        nonLerpLookAt.position.copy(curPoint)
        nonLerpLookAt.lookAt(nonLerpLookAt.position.clone().add(targetLookAt))

        tangent.applyAxisAngle(
            new THREE.Vector3(0, 1 , 0),
            -nonLerpLookAt.rotation.y
        )
        
        /* RAD TO DEG */
        let angle = Math.atan2(-tangent.z, tangent.x)
        angle = -Math.PI / 2 + angle

        let angleDegrees = (angle * 180) / Math.PI
        angleDegrees *= 2.4

        if(angleDegrees < 0){
            angleDegrees = Math.max(angleDegrees, -AIRPLANE_MAX_ANGLE )
        }

        if(angleDegrees > 0){
            angleDegrees = Math.min(angleDegrees, AIRPLANE_MAX_ANGLE )
        }

        /* SET BACK ANGLE */
        angle = (angleDegrees * Math.PI ) / 180

        const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
               airplane.current.rotation.x,
               airplane.current.rotation.y,
               angle,
            )
        )

        airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2)

    })


    const airplane = useRef()

    return <>

        <directionalLight position={[0, 3, 1]} intensity={0.1} />

        {/* <OrbitControls makeDefault/> */}
        <group ref = {cameraGroup}>
            <Background />
            <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
            <group ref = {airplane}>
                <Float floatIntensity={2} speed={3} rotationIntensity={0.5}>
                    <DogPlane 
                        rotation-y = {Math.PI / 2 } 
                        scale = { [ 0.55, 0.55, 0.55]} 
                        position-y = {0.2} 
                        />
                </Float>
            </group>
        </group>
        /**
            TEXT
         */
        <group position={[-3, 0, -100]}>
            <Text
                color="white"
                anchorX={"left"}
                anchorY="middle"
                fontSize={0.22}
                maxWidth={2.5}
                font={"assets/DMSerifDisplay-Regular.ttf"}
            >
                Welcome to DoggyPlane!{"\n"}
                Have a seat and enjoy the ride!
            </Text>

        </group>

        //SECOND TEXT SECTION

        <group position={[-10, 1, -200]}>
            <Text
                color="white"
                anchorX={"left"}
                anchorY="center"
                fontSize={0.52}
                maxWidth={2.5}
                font={"assets/DMSerifDisplay-Regular.ttf"}                
            >
                Services
            </Text>
            <Text
                color="white"
                anchorX={"left"}
                anchorY="top"
                position-y={-0.66}
                fontSize={0.22}
                maxWidth={2.5}
                font={"assets/DMSerifDisplay-Regular.ttf"}                  
            >
                Do you want a drink {"\n"}
                We have a wide range of baverages!
            </Text>
        </group>

        /**
            LINE PATH
         */
        <group position-y={-2} >
            {/* <Line 
                points = {linePoints}
                color = {"white"}
                opacity = {0.7}
                transparent
                lineWidth={16}

            /> */}
            <mesh>
                <extrudeGeometry
                    args={[
                        shape,
                        {
                            steps : LINE_NB_POINTS,
                            bevelEnabled : false,
                            extrudePath : curve,
                        }
                    ]} />
                <meshStandardMaterial color={"white"} opacity={1} transparent envMapIntensity={2} />
            </mesh>
        </group>
    </>
}