import { App, TFolder, TFile } from 'obsidian'
import renderError from './render-error'

const getImagesList = (
    app: App,
    container: HTMLElement,
    settings: {[key: string]: any}
  ) => {
  
  // 定义有效的图片扩展名
  const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
  let images: TFile[] = []
  
  // 如果path是根目录，搜索整个vault
  if (settings.path === '/') {
    // 获取vault中所有的文件
    const allFiles = app.vault.getFiles()
    
    // 筛选图片文件
    images = allFiles.filter(file => 
      validExtensions.includes(file.extension)
    )
  } else {
    // 获取指定路径下的文件
    const folder = app.vault.getAbstractFileByPath(settings.path)
  
    let files
    if (folder instanceof TFolder) { 
      files = folder.children 
    } else {
      const error = 'The folder doesn\'t exist, or it\'s empty!'
      renderError(container, error)
      throw new Error(error)
    }
  
    // 筛选图片文件
    images = files.filter(file => {
      if (file instanceof TFile && validExtensions.includes(file.extension)) return file
    }) as TFile[]
  }
  
  // 根据prefix和pattern筛选图片
  if (settings.prefix || settings.pattern) {
    images = images.filter(file => {
      const fileName = file.name
      
      // 检查前缀
      const hasPrefix = settings.prefix ? fileName.startsWith(settings.prefix) : true
      
      // 检查模式（使用正则表达式）
      let matchesPattern = true
      if (settings.pattern) {
        try {
          const regex = new RegExp(settings.pattern)
          matchesPattern = regex.test(fileName)
        } catch (e) {
          console.error("Invalid regex pattern:", e)
          matchesPattern = false
        }
      }
      
      return hasPrefix && matchesPattern
    })
  }
  
  // 如果没有找到任何图片，显示错误
  if (images.length === 0) {
    const error = 'No images found matching your criteria!'
    renderError(container, error)
    throw new Error(error)
  }



  // sort the list by name, mtime, or ctime
  const orderedImages = images.sort((a: any, b: any) => {
    const refA = settings.sortby === 'name' ? a['name'].toUpperCase() : a.stat[settings.sortby]
    const refB = settings.sortby === 'name' ? b['name'].toUpperCase() : b.stat[settings.sortby]
    return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
  })

  // re-sort again by ascending or descending order
  const sortedImages = settings.sort === 'asc' ? orderedImages : orderedImages.reverse()

  // return an array of objects
  return sortedImages.map(file => {
    return {
      name: file.name,
      folder: file.parent.path,
      uri: app.vault.adapter.getResourcePath(file.path)
    }
  })
}

export default getImagesList