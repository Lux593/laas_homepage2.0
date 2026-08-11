import { motion, type Variants } from "framer-motion"
import { useState } from "react"

interface BookCardProps {
  image?: string
  title?: string
  author?: string
  width?: number
  height?: number
  className?: string
}

const springTransition = { type: "spring" as const, duration: 0.6, bounce: 0 }

const containerShadow: Variants = {
  idle: {
    boxShadow: [
      "0px 0.7px 0.7px -0.625px rgba(0,0,0,0)",
      "0px 1.8px 1.8px -1.25px rgba(0,0,0,0)",
      "0px 3.6px 3.6px -1.875px rgba(0,0,0,0)",
      "0px 6.9px 6.9px -2.5px rgba(0,0,0,0)",
      "0px 13.6px 13.6px -3.125px rgba(0,0,0,0)",
      "0px 30px 30px -3.75px rgba(0,0,0,0)",
    ].join(", "),
  },
  hover: {
    boxShadow: [
      "0px 0.7px 0.7px -0.625px rgba(0,0,0,0.44)",
      "0px 1.8px 1.8px -1.25px rgba(0,0,0,0.43)",
      "0px 3.6px 3.6px -1.875px rgba(0,0,0,0.41)",
      "0px 6.9px 6.9px -2.5px rgba(0,0,0,0.38)",
      "0px 13.6px 13.6px -3.125px rgba(0,0,0,0.31)",
      "0px 30px 30px -3.75px rgba(0,0,0,0.15)",
    ].join(", "),
  },
}

const bookLift: Variants = {
  idle: { z: 0 },
  hover: { z: 50 },
}

const coverFlip: Variants = {
  idle: { rotateY: 0, z: 0 },
  hover: { rotateY: -70, z: 10, originX: 0 },
}

const DEFAULT_COVER =
  "https://framerusercontent.com/images/JXL9OqyS9HXAxdkH6ZGIV5PQXQQ.jpg?scale-down-to=512"

export default function BookCard({
  image = DEFAULT_COVER,
  title = "Steve Jobs",
  author = "Walter Isaacson",
  width = 200,
  height = 305,
  className,
}: BookCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.div
      className={className}
      initial="idle"
      whileHover="hover"
      transition={springTransition}
      variants={containerShadow}
      style={{
        width,
        height,
        cursor: "pointer",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Book wrapper — preserve-3d for real depth */}
      <motion.div
        variants={bookLift}
        transition={springTransition}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve3d",
          perspective: 1200,
        }}
      >
        {/* Paper (behind the cover) — title + author */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 30,
            overflow: "hidden",
            background:
              "linear-gradient(239deg, rgb(255,255,255) 0%, rgb(224,224,224) 100%)",
            zIndex: 0,
          }}
        >
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              fontSize: 20,
              textAlign: "center",
              margin: 0,
              width: "100%",
              wordBreak: "break-word",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 400,
              fontSize: 12,
              textAlign: "center",
              opacity: 0.3,
              margin: 0,
              width: "100%",
              wordBreak: "break-word",
            }}
          >
            {author}
          </p>
        </div>

        {/* Cover (flips open on hover) */}
        <motion.div
          variants={coverFlip}
          transition={springTransition}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            zIndex: 1,
            transformOrigin: "left center",
          }}
        >
          {/* Cover image */}
          <img
            src={image}
            alt={title}
            crossOrigin="anonymous"
            onLoad={() => setImgLoaded(true)}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />

          {/* Spine light — narrow gradient strip on the left */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 18,
              zIndex: 1,
              background: [
                "linear-gradient(90deg,",
                "rgb(0,0,0) 0%,",
                "rgb(255,255,255) 24%,",
                "rgb(0,0,0) 40%,",
                "rgb(255,255,255) 48%,",
                "rgba(255,255,255,0) 100%)",
              ].join(" "),
              opacity: 0.2,
              pointerEvents: "none",
            }}
          />

          {/* Surface light — diagonal sheen across entire cover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(38deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
