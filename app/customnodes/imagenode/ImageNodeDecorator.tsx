import { LexicalEditor } from 'lexical'
import React, { JSX } from 'react'
import { ImageNode } from './imageNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SerializedImageNodeType } from '../types/customNodeTypes';

type ImageNodeDecoratorProps = {node: SerializedImageNodeType}

export function ImageNodeDecorator({node} : ImageNodeDecoratorProps) : JSX.Element {
  console.log(node)
  const [editor] = useLexicalComposerContext();
  return (
    <div className='image-class inline-block'>
      doobshakalaka
      <img src={node.src}/>
    </div>
  )
}