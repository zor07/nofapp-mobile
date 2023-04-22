// import {RemirrorJSON} from "remirror";

export const getDescriptionFromRemirrorJson = (data: any, content: string) : string => {
    // @ts-ignore
    // TODO remirror :(
    data.content.forEach(node => {
        if (node.type !== 'heading' && node.content && node.content.length && node.content.length > 0) {
            content = getDescriptionFromRemirrorJson(node, content)
        } else {
            if (node.type === 'text') {
                content = content.concat(node.text, "\n")
            }
        }
    })
    return content.substring(0, 70).concat('...')
}