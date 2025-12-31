import React from 'react'

const HeroSection = () => {
  return (
    <div className='flex items-center justify-center'>
      <div className="grid-containers">
        <div className="item" style={{ gridArea: "item-1" }}>Item 1</div>
        <div className="item" style={{ gridArea: "item-2" }}>Item 2</div>
        <div className="item" style={{ gridArea: "item-3" }}>Item 3</div>
        <div className="item" style={{ gridArea: "item-4" }}>Item 4</div>
        <div className="item" style={{ gridArea: "item-5" }}>Item 5</div>
      </div>
    </div>
  )
}

export default HeroSection