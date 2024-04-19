import html2Canvas from "html2canvas";
import JsPDF from "jspdf";
export default {
  getPdf(pdfDom, reportName, isDownload, type) {
    //     var target = document.getElementsByClassName("right-aside")[0];
    // target.style.background = "#FFFFFF";
    return new Promise((resolve, reject) => {
      const title = reportName;
      html2Canvas(document.querySelector(pdfDom), {
        allowTaint: false,
        useCORS: true
      }).then((canvas) => {
        console.log(canvas);
        const contentWidth = canvas.width;
        const contentHeight = canvas.height;
        // 一页pdf显示html页面生成的canvas高度;
        const pageHeight = contentWidth / 592.28 * 841.89;
        // 未生成pdf的html页面高度
        let leftHeight = contentHeight;
        // 页面偏移
        let position = 0;
        // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        let imgWidth = 595.28;
        let imgHeight = 592.28 / contentWidth * contentHeight;
        if (type == 2) {
          imgWidth = 846;
          imgHeight = 593;
        } else {
          imgWidth = 596;
          imgHeight = 952;
        };
        const pageData = canvas.toDataURL("image/jpeg", 1.0);
        // return resolve(pageData);
        const PDF = new JsPDF("", "pt", "a4");
        // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        // 当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, "JPEG", 0, 0, imgWidth, imgHeight);
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
            leftHeight -= pageHeight;
            position -= 841.89;
            // 避免添加空白页
            if (leftHeight > 0) {
              PDF.addPage();
            }
          }
        }
        if (isDownload) {
          PDF.save(title + ".pdf");
        }
        // 删除本地存储的base64字段
        const pdfData = PDF.output("datauristring"); // 获取base64Pdf
        resolve(pdfData);
      });
    });
  }
};
// }
