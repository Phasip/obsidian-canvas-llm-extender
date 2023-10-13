# You have to have your own OpenAI API key!!

# Canvas LLVM Extender
Let the OpenAI LLM add nodes to your canvas. Only works on text nodes for now, probably breaks when using other nodes.
Right click a node in your canvas and select LLM Extender and the plugin will automatically add a new outgoing edge to a new node. The text in the new node is generated by OpenAI based on your nearby (edge-wise) nodes

## Suggested contributions (aka TODO)
- Add support for other nodes
- Add support for other AI services
- Verify use of sibling nodes as input to prompt
- Support multiple prompt based actions
- Limit number of tokens in output
- Clean up code to be more javascriptic
- Solve the stuff I used ts-ignore on
- Handle errors
- Install instructions, better readme, example video

## State
Pre alpha - I wrote until it seems to work for me.

## Build
apt install node-typescript
npm run build