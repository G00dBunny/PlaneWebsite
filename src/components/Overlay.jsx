import { useProgress } from "@react-three/drei"
import { usePlay } from "../contexts/Play"

export const Overlay = () =>{
    const {progress} = useProgress()
    const { play, setPlay } = usePlay();

    return (
        <div className="overlay">
            <div className={`loader ${progress === 100 ? "loader--disappear" : ""}`} />
            {progress === 100 && (
                 <div className={`intro ${play ? "intro--disappear" : ""}`}>
                    <h1 className="logo">
                        DOGGYPLANE
                        <div className="spinner">
                            <div className="spinner_image" />
                        </div>
                    </h1>
                    <button
                      className="explore"
                      onClick={() => {
                        setPlay(true);
                     }}
                    >
                        Explore
                    </button>
                </div>
            )}
        </div>
    )
}