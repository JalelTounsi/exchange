import React from 'react';

const PageButton = props => {
  return (
    <div className="btn">
      <span className={props.isBold ? "pageButtonBold hoverBold" : "pageButtonBold hoverBold"}>
        {props.name}
      </span>
    </div>
  )
}

export default PageButton