import React, { JSX } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SerializedImageNodeType } from '../types/customNodeTypes';
import "./ImageNodeDecorator.css";

type ImageNodeDecoratorProps = {node: SerializedImageNodeType}

export function ImageNodeDecorator({node} : ImageNodeDecoratorProps) : JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <div className='image-class inline-block' >
      <img src={node.src}/>
    </div>
  )
}