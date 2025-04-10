import { App, Platform } from 'obsidian'
import Lightbox from 'lightgallery';
import LightboxThumbs from 'lightgallery/plugins/thumbnail'

const lightbox = (gallery: HTMLElement, imagesList: {[key: string]: any}, app: App) => {
  // 确保图片元素有正确的属性设置
  const items = gallery.querySelectorAll('.grid-item');
  items.forEach((item, index) => {
    const file = imagesList[index];
    if (file) {
      // 确保data-src属性设置正确
      item.setAttribute('data-src', file.uri);
      
      // 添加子标题数据属性用于显示图片名称
      if (file.name) {
        item.setAttribute('data-sub-html', `<h4>${file.name}</h4>`);
      }
    }
  });

  // 附加自定义按钮打开原始图片，仅桌面版
  if (Platform.isDesktop) globalSearchBtn(gallery, imagesList);

  // 设置lightbox参数
  const galleryLightbox = Lightbox(gallery, {
    plugins: [LightboxThumbs],
    counter: false,
    download: false,
    thumbnail: true,
    loop: true,
    mode: 'lg-fade',
    selector: '.grid-item', // 明确指定选择器
    licenseKey: '622E672F-760D49DC-980EF90F-B7A9DCB0',
    speed: 500,
    backdropDuration: 400,
    // 启用子标题
    subHtmlSelectorRelative: true, 
    appendSubHtmlTo: '.lg-item'
  });

  // 为lightbox添加事件监听器确保图片名称显示
  gallery.addEventListener('lgAfterSlide', (event: any) => {
    const index = event.detail.index;
    const file = imagesList[index];
    
    // 找到当前活动的lightbox项并确保显示内容
    const lgContainer = document.querySelector('.lg-container');
    if (lgContainer) {
      const currentItem = lgContainer.querySelector('.lg-current');
      if (currentItem && !currentItem.querySelector('.lg-sub-html') && file) {
        const subHtml = document.createElement('div');
        subHtml.className = 'lg-sub-html';
        subHtml.innerHTML = `<h4>${file.name}</h4>`;
        currentItem.appendChild(subHtml);
      }
    }
  });

  // 移动设备上，确保移除不必要的控件
  if (Platform.isIosApp || Platform.isAndroidApp) {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.lg-close, .lg-prev, .lg-next');
    for (const element of elements) {
      element.style.display = 'none';
    }
  }

  return galleryLightbox;
}

const globalSearchBtn = (gallery: HTMLElement, imagesList: {[key: string]: any}) => {
  gallery.addEventListener('lgInit', (event: CustomEvent) => {
    const galleryInstance = event.detail.instance;
    const btn ='<button type="button" id="btn-glob-search" class="lg-icon btn-glob-search"></button>';
    galleryInstance.outer.find('.lg-toolbar').append(btn);

    galleryInstance.outer.find('#btn-glob-search').on('click', () => {
      const index = galleryInstance.index;
      const selected = imagesList[index];
      app.workspace.openLinkText('', `${selected.folder}/${selected.name}`, true, {active: true});
      galleryInstance.closeGallery();
    });
  });
}

export default lightbox;