import { Text } from "@fluidity-money/surfing";
import { motion, Transition } from "framer-motion";

interface ISpinner {
  loading?: boolean;
}

const transition = { duration: 2.5, ease: "easeInOut", repeatDelay: 1, repeat: Infinity, repeatType: 'loop'} as Transition;

export const Spinner: React.FC<ISpinner> = (props) => {
  return (
    <motion.div
      style={{
        position: "relative",
        top: "200px",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "30%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 1110.9 451.9"
      >
        <defs>
        </defs>
        <g id="Layer_2_00000124155392201894683590000008958482076611758992_">
          <g id="Layer_1-2">
            <motion.path
              d="M421.1,24c-48.6,0-88.9,15.5-124.5,43.9c-36.1,28.8-58.6,66.7-75.1,110.2V43.4c-13.8,8.4-23.7,13.6-32.5,20
                c-40.9,29.7-64.6,71.1-82.6,118.1v-81.4c-65.1,52.8-60.4,205.5,1.1,247.9v-80.5c20.2,59.7,53.5,106.2,115,138.2V270.5
                c5.5,5.7,7.4,11.6,9.5,17.4c29.7,79.7,86.9,125.3,171.5,136.8c6,0.6,12,0.9,18,0.8c1.5,0,2.4,0,2.4,0v-18.4c0,0,0-68.6,0-102.9
                v-28c34.7,87.8,94.1,143.5,189,148.1c4.5,0.2,9,0.3,13.4,0.3c101.1,0,164.8-57.6,200.3-152.9v147.1c76.7-24,122-73.3,149.5-144
                v98.9c52.5-41.2,76.2-94.1,73.6-157.4c-2.4-56.9-24.6-105.3-74.5-146.9v104.9c-26.3-72-72.6-120.4-148.9-144.7V177
                C792.2,83.8,729.9,26,628.7,24.2c-1.6,0-3.2,0-4.8,0c-99.9-0.1-163.3,56-200.1,148.2V24H421.1L421.1,24z"
                fillOpacity={0}
              strokeWidth="8"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeLinecap="round"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: 1}}
              transition={transition}
            />
          </g>
        </g>
      </svg>
      <motion.div
        initial={{y: '0px', opacity: 0}}
        animate={{y: ['5px', '0px'], opacity: [1,1]}}
        transition={{duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror'}}
        style={{marginTop: '20px'}}
      >
        <Text>Entering the incentive layer...</Text>
      </motion.div>
    </motion.div>
  );
};
