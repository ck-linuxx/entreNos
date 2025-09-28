import React from 'react'

/**
 * Componente Logo da aplicação Entre Nós
 * 
 * @param {string} size - Classes Tailwind para tamanho (ex: 'w-8 h-8', 'w-16 h-16')
 * @param {string} className - Classes CSS adicionais
 * @param {boolean} showBackground - Se deve mostrar o fundo gradiente azul-verde
 * @param {boolean} animate - Se deve aplicar animação de pulse
 * @param {string} variant - Variante da cor ('default', 'white', 'blue')
 * 
 * Exemplos de uso:
 * - Navigation: <Logo size="w-8 h-8" showBackground={true} />
 * - Login: <Logo size="w-16 h-16" showBackground={true} />
 * - Loading: <Logo size="w-8 h-8" showBackground={true} animate={true} />
 * - Sem fundo: <Logo size="w-12 h-12" showBackground={false} variant="blue" />
 */
const Logo = ({ 
  size = 'w-8 h-8', 
  className = '', 
  showBackground = true,
  animate = false,
  variant = 'default' // 'default', 'white', 'blue'
}) => {
  const containerClasses = `
    ${size} 
    ${showBackground ? 'bg-gradient-to-br from-blue-600 to-green-600 rounded-lg shadow-sm' : ''} 
    ${animate ? 'animate-pulse' : ''} 
    flex items-center justify-center 
    ${className}
  `.trim()

  // Determinar o filtro baseado no variant e showBackground
  const getImageFilter = () => {
    if (showBackground) {
      // Quando tem fundo gradiente, sempre usar logo branca
      return 'brightness(0) invert(1)'
    } else {
      // Quando não tem fundo, usar a cor especificada
      switch (variant) {
        case 'white':
          return 'brightness(0) invert(1)'
        case 'blue':
          return 'hue-rotate(210deg) saturate(1.5) brightness(0.7)'
        default:
          return 'hue-rotate(210deg) saturate(1.5) brightness(0.7)' // azul por padrão
      }
    }
  }

  return (
    <div className={containerClasses}>
      <img 
        src="/logoFinal.svg" 
        alt="Entre Nós Logo" 
        className={`${showBackground ? 'w-5/6 h-5/6' : 'w-full h-full'} object-contain transition-all duration-200`}
        style={{
          filter: getImageFilter()
        }}
      />
    </div>
  )
}

export default Logo