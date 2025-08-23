import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyLoading } from '../../hooks/useLazyLoading';
// import { LoadingSpinner } from '../ui/LoadingSpinner';


interface PageTransitionProps {
  children: ReactNode;
  loadingDelay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  loadingDelay = 30
}) => {
  const isLoading = useLazyLoading(loadingDelay);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Waterfall loader for in-app loading */}
          <div style={{position:'fixed',inset:0,zIndex:50,background:'linear-gradient(135deg,#1B4332 0%,#264653 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{display:'flex',alignItems:'flex-end',height:80,marginBottom:24,position:'relative'}}>
              {[0,1,2,3,4].map(i=>(
                <div key={i} style={{
                  width:10,
                  height:60,
                  margin:'0 4px',
                  borderRadius:6,
                  background:'linear-gradient(180deg,#4FC3F7 0%,#1976D2 100%)',
                  opacity:0.85,
                  animation:`waterfall-fall 1.1s cubic-bezier(0.4,0,0.2,1) infinite`,
                  animationDelay:`${i*0.18}s`
                }} />
              ))}
              <div style={{
                position:'absolute',
                left:'50%',
                bottom:-10,
                width:40,
                height:16,
                background:'radial-gradient(ellipse at center,#B3E5FC 60%,transparent 100%)',
                opacity:0.7,
                transform:'translateX(-50%)',
                animation:'splash-anim 1.1s cubic-bezier(0.4,0,0.2,1) infinite'
              }} />
            </div>
            <div style={{color:'#B3E5FC',fontFamily:'Oswald,sans-serif',fontSize:24,fontWeight:600,marginBottom:8,letterSpacing:1,textShadow:'0 2px 8px #1976D2'}}>Loading Adventures...</div>
            <div style={{color:'#E3F2FD',fontFamily:'Inter,sans-serif',fontSize:16,letterSpacing:0.5,textShadow:'0 1px 4px #1976D2'}}>Welcome to Wilderness</div>
            {/* Keyframes are now in global CSS (index.html) to avoid React errors */}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.32, 
            ease: [0.25, 0.46, 0.45, 0.94] // Custom ease for smooth transition
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
