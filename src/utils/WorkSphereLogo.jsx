/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const WorkSphereLogo = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                width="50"
                height="50"
                className="text-blue-600"
            >
                <circle cx="50" cy="50" r="45" fill="#2563eb" /> {/* blue-600 hex */}
                <path
                    d="M20,50 a30,10 0 1,0 60,0 a30,10 0 1,0 -60,0"
                    fill="white"
                />
                <path
                    d="M30,30 a20,5 0 1,0 40,0 a20,5 0 1,0 -40,0"
                    fill="white"
                />
                <path
                    d="M30,70 a20,5 0 1,1 40,0 a20,5 0 1,1 -40,0"
                    fill="white"
                />
            </svg>
            <span className="text-2xl font-extrabold text-blue-600">
                WorkSphere
            </span>
        </motion.div>
    );
};

export default WorkSphereLogo;
