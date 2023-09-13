import { Line, Float, OrbitControls, useScroll, PerspectiveCamera, Text } from '@react-three/drei'
import { Background } from './background.jsx'
import { DogPlane } from './DogPlane.jsx'
import {  useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from "three"
import { useFrame } from '@react-three/fiber'
import { TextSection } from './TextSection.jsx'
import { lerp } from 'three/src/math/MathUtils.js'
import { gsap } from "gsap";
import { usePlay } from '../contexts/Play.jsx'


const LINE_NB_POINTS = 1000
const CURVE_DISTANCE = 250
const CURVE_AHEAD_CAMERA = 0.008
const CURVE_AHEAD_AIRPLANE = 0.02
const AIRPLANE_MAX_ANGLE = 35
const FRICTION_DISTANCE = 42


export default function Experience()
{
    const curvePoints = useMemo(() => [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -CURVE_DISTANCE),
            new THREE.Vector3(100, 0, -2 * CURVE_DISTANCE),
            new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
            new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -5 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -6 * CURVE_DISTANCE),
            new THREE.Vector3(0, 0, -7 * CURVE_DISTANCE),
        ]
    , [])

    const sceneOpacity = useRef(0)
    const lineMaterialRef = useRef()


    const curve = useMemo(() =>
    {
        return new THREE.CatmullRomCurve3(
            curvePoints,
            false,
            "catmullrom",
            0.5)
    }, [])

    const textSections = useMemo(() => {
        return [{
            cameraRailDist : -1,
            position : new THREE.Vector3(
                curvePoints[1].x - 3,
                curvePoints[1].y,
                curvePoints[1].z
            ),
            subtitle : `Welcome to Wawatmos,
            Have a seat and enjoy the ride!`,
        },

        {
            cameraRailDist : 2.5,
            position : new THREE.Vector3(
                curvePoints[2].x + 3,
                curvePoints[2].y,
                curvePoints[2].z
            ),
            title: "Services",
            subtitle : `Do you want a drink?
            We have a wide range of beverages!`,
        },

        {
            cameraRailDist : -2.5,
            position : new THREE.Vector3(
                curvePoints[3].x - 4,
                curvePoints[3].y,
                curvePoints[3].z
            ),
            title: "Fear of flying?",
            subtitle : `Our flights attendants will help you have a great journey`,
        },

        {
            cameraRailDist : 2,
            position : new THREE.Vector3(
                curvePoints[4].x + 3,
                curvePoints[4].y,
                curvePoints[4].z - 12
            ),
            title: "Movies",
            subtitle : `We provide a large selection of medias, we highly recommend you Porco Rosso `,
        },
        
     ]

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
    const cameraRail = useRef()
    const scroll = useScroll()
    const lastScroll = useRef(0)

    const { play} = usePlay()




    useFrame((_state, delta) =>{

        lineMaterialRef.current.opacity = sceneOpacity.current;

        if(play && sceneOpacity.current<1) {
            sceneOpacity.current = THREE.MathUtils.lerp(
                sceneOpacity.current,
                1,
                delta * 0.1
            )
        }
        // const curPointIndex = Math.min(
        //     Math.round(scroll.offset * linePoints.length),
        //     linePoints.length - 1
        // )

        const scrollOffset = Math.max(0, scroll.offset)

        let friction = 1 
        let resetCameraRail =  true
        //LOOK TO CLOSE TEXT SECTIONS
        textSections.forEach((textSection) =>{
            const distance = textSection.position.distanceTo(
                cameraGroup.current.position
            )

            if (distance < FRICTION_DISTANCE )
            {
                friction = Math.max(distance / FRICTION_DISTANCE, 0.1)
                const targetCameraRailPosition = new THREE.Vector3(
                    (1-distance / FRICTION_DISTANCE) * textSection.cameraRailDist,
                    0,
                    0,
                )
                cameraRail.current.position.lerp(targetCameraRailPosition, delta)
                resetCameraRail = false
            }
        }) 

        if(resetCameraRail){
            const targetCameraRailPosition = new THREE.Vector3(0, 0, 0)
            cameraRail.current.position.lerp(targetCameraRailPosition, delta)

        }

        //CALCULATE LERPED SCROLL OFFSET

        let lerpedScrollOffset = THREE.MathUtils.lerp(lastScroll.current, scrollOffset, delta * friction)

        //PROTECT BELOW 0 AND ABOVE 1
        lerpedScrollOffset = Math.min(lerpedScrollOffset, 1)
        lerpedScrollOffset = Math.max(lerpedScrollOffset, 0)

        lastScroll.current = lerpedScrollOffset
        tl.current.seek(lerpedScrollOffset * tl.current.duration())


        /**
         * Follow the curve points
         */
        const curPoint = curve.getPoint(lerpedScrollOffset)

        cameraGroup.current.position.lerp(curPoint, delta *20)


        // Make the group look ahead on the curve

        const lookAtPoint = curve.getPoint(
            Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1)
        )

        const currentLookAt = cameraGroup.current.getWorldDirection(
            new THREE.Vector3()
        )
        const targetLookAt = new THREE.Vector3().subVectors(curPoint, lookAtPoint).normalize()

        const lookAt = currentLookAt.lerp(targetLookAt, delta *24)
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

    //tl = timeline
    const tl = useRef()
    const backgroundColors = useRef({
        colorA : "#3535cc",
        colorB: "#abaadd",
    })

    const planeInTl = useRef()



    useLayoutEffect(() => {
        tl.current = gsap.timeline()

        tl.current.to(backgroundColors.current, {
            duration : 1,
            colorA : "#6f35cc",
            colorB: "#ffad30",
        })
        tl.current.to(backgroundColors.current, {
            duration : 1,
            colorA : "#424242",
            colorB: "#ffcc00",
        })
        tl.current.to(backgroundColors.current, {
            duration : 1,
            colorA : "#81318b",
            colorB: "#55ab8f",
        })
        tl.current.pause()

        planeInTl.current = gsap.timeline()
        planeInTl.current.pause()
        planeInTl.current.from(airplane.current.position, {
            duration : 3,
            z: 5,
            y: -2,
        })
        
    }, [])
    
    useEffect(() => {
        if (play) {
            planeInTl.current.play()
        }
    }, [play])

    return <>

        <directionalLight position={[0, 3, 1]} intensity={0.1} />

        {/* <OrbitControls makeDefault/> */}
        <group ref = {cameraGroup}>
            <Background backgroundColors = {backgroundColors} />
            <group ref={cameraRail}>
                <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
            </group>
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
       
        {
            textSections.map((textSection, index) =>(
                <TextSection{...textSection} key = {index} />
            ))
        }

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
                <meshStandardMaterial 
                    color={"white"} 
                    ref={lineMaterialRef}
                    transparent 
                    envMapIntensity={2} 
                />
            </mesh>
        </group>
    </>
}