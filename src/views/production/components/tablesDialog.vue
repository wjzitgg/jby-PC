<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="生产流程表格" :visible="tablesDialog" @close="handleClose" width="60%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <div class="dialog-search">
          <div class="dialog-search-item">
            <div class="dialog-search-item-label">分项工程</div>
            <div class="dialog-search-item-content">
              <el-input v-model="inpData.itemName" size="mini" maxlength="50"></el-input>
            </div>
          </div>
          <div class="dialog-search-item">
            <div class="dialog-search-item-label">表格名称</div>
            <div class="dialog-search-item-content">
              <el-input v-model="inpData.tableName" size="mini" maxlength="50"></el-input>
            </div>
          </div>
          <el-button type="primary" size="mini" @click="search">搜索</el-button>
        </div>
        <div class="tables">
          <el-table border style="width: 100%" height="100%" :data="tableData" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="表格名称" align="center" prop="tableName"> </el-table-column>
            <el-table-column label="应用于分项工程" align="center" prop="applicationItemName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" align="center" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-button plain size="mini" @click="examine(row)" v-has="'production:setting:processTableQuery'">查看</el-button>
                <el-button plain type="primary" size="mini" @click="edit(row)" v-show="row.isUpdate" v-has="'production:setting:processTableEdit'">编辑</el-button>
              </template>
            </el-table-column>

            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="tablesDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog :title="addTitle" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="position: relative" class="dialog-form">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="专业类别"  prop="fkProfessionalTypeId" :label-width="formLabelWidth">
            <!-- <el-select style="width: 100%" disabled v-model="form.fkProfessionalTypeId" placeholder="请选择">
              <el-option v-for="item in itemType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select> -->
             <el-input v-model="form.professionalTypeName" disabled autocomplete="off"  maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="表格类型" prop="tableType" :label-width="formLabelWidth" v-if="user.orgType == 5">
            <el-select style="width: 100%" disabled v-model="form.tableType" placeholder="请选择">
              <el-option label="普通表格" value="0"> </el-option>
              <el-option label="质量评定表" value="1"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="表格名称" prop="tableName" :label-width="formLabelWidth">
            <el-input v-model="form.tableName" autocomplete="off"  maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="排序值" prop="sortval" :label-width="formLabelWidth">
            <el-input v-model="form.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="channelInputLimit"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
            <el-input v-model="form.remark" autocomplete="off" maxlength="100"></el-input>
          </el-form-item>

          <el-form-item label="表格内容" prop="tableHtml" :label-width="formLabelWidth">
            <el-input size="mini" v-model="imageUrl" v-show="false" autocomplete="off"></el-input>
            <div v-if="srcList.length" style="border: 1px solid #dcdfe6; border-radius: 5px">
              <el-image style="width: 100px; height: 100px" :src="imageUrl" :preview-src-list="srcList"> </el-image>
            </div>
            <div v-else style="line-height: 100px; border: 1px solid #ccc; text-align: center; font-size: 18px">未设计</div>
          </el-form-item>
        </el-form>
        <el-button size="mini" @click.native="design" style="position: absolute; left: 38px; bottom: 38px; margin: 0">设计表格</el-button>
        <el-button size="mini" @click.native="preview" style="position: absolute; left: 50px; bottom: 0px">预览</el-button>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submit">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="预览表格" :visible.sync="show2" :width="shortDmOrientation == 1 ? '880px' : '1300px'" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="display: flex" class="dialog-form">
        <div :style="'width:' + pvwWidth + 'px;'" style="margin: 20px; display: inline-block" v-if="show2">
          <div style="width: 100%; height: 500px; overflow: auto; border: 1px solid; background: #fff">
            <div ref="previewTable" id="previewTable" :style="'padding-top:' + ranks.top + 'px;' + 'padding-left:' + ranks.left + 'px'" style="width: 100%; background: #fff; padding-top: 8px; overflow: hidden">
              <!-- transform:scale(0.8);transform-origin: 0 0; transform:scale(0.7);transform-origin: 0 0;-->
              <table style="border-collapse: collapse; margin-top: 2px; margin-left: 28px; background: #fff; color: #000" ref="printPage" id="printPage">
                <tr v-for="(item, idx) in tabulationArr" :key="idx" style="">
                  <!-- :class="{ 'pre-wrap': i.name.indexOf('\n') != -1 }"  -->
                  <td style="border: none; margin: 0; padding: 0" @blur="tdBlur(item, id, $event.target.innerText, $event)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                    <div v-if="i.attributeTypes == 1 && i.checkout == false" :class="{ 'pre-wrap': i.name.indexOf('\n') != -1 }">
                      {{ i.name }}
                    </div>
                    <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
                    <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
                    <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        <div style="display: inline-block; margin-top: 20px; width: 150px">
          <el-button @click="print" type="primary" size="mini">打印</el-button>
          <!-- 普通 -->
          <div :class="{ ranks: ranksCode == 0 }" @click="ranksCodeClick(0)" style="margin-top: 6px; padding: 4px 6px; border: 1px solid">
            <div style="font-weight: 700; margin-left: 40px; font-size: 14px; color: #000">普通</div>
            <div style="display: flex">
              <div style="position: relative; width: 40px; height: 60px; border: 1px solid">
                <div class="left-xian" style="height: 100%; width: 1px; background: #000; position: absolute; left: 5px; top: 0"></div>
                <div class="top-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; top: 4px"></div>
                <div class="right-xian" style="height: 100%; width: 1px; background: #000; position: absolute; right: 5px; top: 0"></div>
                <div class="bottom-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; bottom: 4px"></div>
              </div>
              <div style="font-size: 12px">
                <div style="margin-left: 5px">上：20</div>
                <div style="margin-left: 5px">下：10</div>
                <div style="margin-left: 5px">左：20</div>
                <div style="margin-left: 5px">右：10</div>
              </div>
            </div>
          </div>
          <!-- 宽 -->
          <div :class="{ ranks: ranksCode == 1 }" @click="ranksCodeClick(1)" style="margin-top: 6px; padding: 4px 6px; border: 1px solid">
            <div style="font-weight: 700; margin-left: 40px; font-size: 14px; color: #000">宽</div>
            <div style="display: flex">
              <div style="position: relative; width: 40px; height: 60px; border: 1px solid">
                <div class="left-xian" style="height: 100%; width: 1px; background: #000; position: absolute; left: 10px; top: 0"></div>
                <div class="top-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; top: 4px"></div>
                <div class="right-xian" style="height: 100%; width: 1px; background: #000; position: absolute; right: 10px; top: 0"></div>
                <div class="bottom-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; bottom: 4px"></div>
              </div>
              <div style="font-size: 12px">
                <div style="margin-left: 5px">上：30</div>
                <div style="margin-left: 5px">下：100</div>
                <div style="margin-left: 5px">左：30</div>
                <div style="margin-left: 5px">右：100</div>
              </div>
            </div>
          </div>
          <!-- 窄 -->
          <div :class="{ ranks: ranksCode == 2 }" @click="ranksCodeClick(2)" style="margin-top: 6px; padding: 4px 6px; border: 1px solid">
            <div style="font-weight: 700; margin-left: 40px; font-size: 14px; color: #000">窄</div>
            <div style="display: flex">
              <div style="position: relative; width: 40px; height: 60px; border: 1px solid">
                <div class="left-xian" style="height: 100%; width: 1px; background: #000; position: absolute; left: 2px; top: 0"></div>
                <div class="top-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; top: 4px"></div>
                <div class="right-xian" style="height: 100%; width: 1px; background: #000; position: absolute; right: 2px; top: 0"></div>
                <div class="bottom-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; bottom: 4px"></div>
              </div>
              <div style="font-size: 12px">
                <div style="margin-left: 5px">上：10</div>
                <div style="margin-left: 5px">下：10</div>
                <div style="margin-left: 5px">左：10</div>
                <div style="margin-left: 5px">右：10</div>
              </div>
            </div>
          </div>
          <!-- 自定义 -->
          <div :class="{ ranks: ranksCode == 3 }" @click="ranksCodeClick(3)" v-if="ranksCode == 3" style="margin-top: 6px; padding: 4px 6px; border: 1px solid">
            <div style="font-weight: 700; margin-left: 40px; font-size: 14px; color: #000">自定义设置</div>
            <div style="display: flex">
              <div style="position: relative; width: 40px; height: 60px; border: 1px solid">
                <div class="left-xian" style="height: 100%; width: 1px; background: #000; position: absolute; left: 2px; top: 0"></div>
                <div class="top-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; top: 4px"></div>
                <div class="right-xian" style="height: 100%; width: 1px; background: #000; position: absolute; right: 2px; top: 0"></div>
                <div class="bottom-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0; bottom: 4px"></div>
              </div>
              <div style="font-size: 12px">
                <div style="padding: 2px">
                  <!-- <span>上：{{ ranks.top }}</span>
                  <span style="margin-left:5px">下：{{ ranks.bottom }}</span> -->
                  <div>上：{{ ranks.top }}</div>
                  <div>下：{{ ranks.bottom }}</div>
                  <div>左：{{ ranks.left }}</div>
                  <div>右：{{ ranks.right }}</div>
                </div>
                <!-- <div style="padding: 2px;">
                  <span>左：{{ ranks.left }}</span>
                  <span style="margin-left:5px">右：{{ ranks.right }}</span>
                </div> -->
              </div>
            </div>
          </div>
          <div style="margin-top: 8px">
            <el-button size="mini" @click="ranksEdit = true">自定义边距</el-button>
            <!-- <el-button type="primary" size="mini" style="margin:5px 0px 0px 0px">保存设置</el-button> -->
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="边距设置" width="600px" :visible.sync="ranksEdit" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="display: flex" class="dialog-form">
        <div style="margin: 100px 16px 0px 60px">左<el-input-number v-model="noSaveb.left" size="mini" :min="1" :max="200" label="描述文字"></el-input-number></div>
        <div>
          <div style="margin: 5px">上 <el-input-number v-model="noSaveb.top" size="mini" :min="1" :max="200" label="描述文字"></el-input-number></div>
          <div style="position: relative; width: 160px; height: 260px; border: 1px solid">
            <div class="left-xian" style="height: 100%; width: 1px; background: #000; position: absolute; left: 2px; top: 0" :style="'left:' + noSaveb.left + 'px'"></div>
            <div class="top-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0" :style="'top:' + noSaveb.top + 'px'"></div>
            <div class="right-xian" style="height: 100%; width: 1px; background: #000; position: absolute; top: 0" :style="'right:' + noSaveb.right + 'px'"></div>
            <div class="bottom-xian" style="width: 100%; height: 1px; background: #000; position: absolute; left: 0" :style="'bottom:' + noSaveb.bottom + 'px'"></div>
          </div>
          <div style="margin: 5px">下 <el-input-number v-model="noSaveb.bottom" size="mini" :min="0" :max="200" label="描述文字"></el-input-number></div>
        </div>
        <div style="margin: 5px">
          <div style="margin: 30px; margin-top: 100px">右 <el-input-number v-model="noSaveb.right" size="mini" :min="0" :max="200" label="描述文字"></el-input-number></div>
        </div>
      </div>
      <div slot="footer">
        <el-button size="mini" type="info" @click="ranksEdit = false">取消</el-button>
        <el-button type="primary" @click="marginNumBer" size="mini">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog class="custom-table-edit" id="customTableEdit" ref="customTableEdit" width="80%" height="100%" title="设计表格" :visible.sync="show3" v-dialogDrag :close-on-click-modal="false" :show-close="false" :close-on-press-escape="false" v-loading="loading" custom-class="design-table-edit">
      <div class="operate">
        <div style="margin-left: 12px" class="short-dmOrientation" @click="previewEdition">
          <i class="el-icon-printer" style="font-size: 22px"></i>
          <div>预览</div>
        </div>
        <div style="margin-left: 12px; width: 4px; height: 36px; background: #ccc"></div>
        <div style="margin-left: 12px; width: 34px">纸张属性</div>
        <div style="line-height: 34px; width: 34px; text-align: center" class="pitch-on">A4</div>
        <div style="margin-left: 12px; width: 4px; height: 36px; background: #ccc"></div>
        <div style="margin-left: 12px; width: 34px">纸张方向</div>
        <div class="short-dmOrientation" @click="vertical" style="line-height: 34px; width: 34px; text-align: center; background: #ccc" :class="{ 'pitch-on': shortDmOrientation == 1 }">纵向</div>
        <div class="short-dmOrientation" @click="crosswise" style="margin-left: 12px; line-height: 34px; width: 34px; text-align: center; background: #ccc" :class="{ 'pitch-on': shortDmOrientation == 2 }">横向</div>
        <div style="margin-left: 12px; width: 4px; height: 36px; background: #ccc"></div>
        <div style="margin-left: 12px; width: 34px">文字属性</div>
        <div style="margin-left: 12px; line-height: 34px">
          <el-select size="mini" v-model="typeface" @change="typefaceChange" placeholder="请选择" style="width: 100px">
            <el-option label="微软雅黑" value="Microsofit Yaheii"></el-option>
            <el-option label="黑体" value="SimHei"></el-option>
            <el-option label="楷体" value="KaiTi"></el-option>
            <el-option label="宋体" value="SimSun"></el-option>
            <el-option label="仿宋" value="FangSong"></el-option>
          </el-select>
          <el-select size="mini" v-model="fontSize" @change="fontSizeChange" placeholder="请选择" style="width: 70px">
            <el-option v-for="item in sizeArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button :class="{ 'pitch-on': fontWeight == 'bolder' }" size="mini" @click="fontWeightClick">B</el-button>
          <el-button :class="{ 'pitch-on': fontStyle == 'italic' }" size="mini" @click="fontStyleClick">/</el-button>
          <el-button :class="{ 'pitch-on': textDecoration == 'underline' }" style="text-decoration:underline" size="mini" @click="fontUnderline">U</el-button>
          <el-button :class="{ 'pitch-on': textAlign == 'left' }" size="mini" @click="textLeft" icon="iconfont iconjuzuoduiqi"></el-button>
          <el-button :class="{ 'pitch-on': textAlign == 'center' }" size="mini" @click="textCenter" icon="iconfont iconjuzhong1"></el-button>
          <el-button :class="{ 'pitch-on': textAlign == 'right' }" size="mini" @click="textRight" icon="iconfont iconjuyouduiqi"></el-button>
          <el-button :class="{ 'pitch-on': verticalAlign == 'top' }" size="mini" @click="textUp" icon="iconfont iconjushang"> </el-button>
          <el-button :class="{ 'pitch-on': verticalAlign == 'middle' }" size="mini" @click="textMiddle" icon="iconfont iconjuzhong"></el-button>
          <el-button :class="{ 'pitch-on': verticalAlign == 'bottom' }" size="mini" @click="textDown" icon="iconfont iconjuxia"></el-button>
        </div>
        <div style="margin-left: 12px; width: 34px">边框属性</div>
        <div style="margin-left: 12px; line-height: 34px">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-button size="mini" icon="el-icon-menu"></el-button>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :tabindex="1" @click.native="noBorder" icon="iconfont icon24gl-borderNone">无边框</el-dropdown-item>
              <el-dropdown-item :tabindex="2" @click.native="borderBottom" icon="iconfont icon24gl-borderBottom">下边框</el-dropdown-item>
              <el-dropdown-item :tabindex="3" @click.native="borderTop" icon="iconfont icon24gl-borderTop">上边框</el-dropdown-item>
              <el-dropdown-item :tabindex="4" @click.native="borderLeft" icon="iconfont icon24gl-borderLeft">左边框</el-dropdown-item>
              <el-dropdown-item :tabindex="5" @click.native="borderRight" icon="iconfont icon24gl-borderRight">右边框</el-dropdown-item>
              <el-dropdown-item :tabindex="6" @click.native="allBorder" icon="iconfont iconjurassic_border-all">所有边框</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button @click="combine" :class="{ 'pitch-on': splitRow > 1 || splitSpan > 1 }" size="mini" plain>合并表格</el-button>
          <el-button size="mini" :class="{ 'pitch-on': fullscreen }" @click.native="handleFullScreen">全屏</el-button>
        </div>
      </div>
      <div class="custom-table" @click="(rightEditStatus = false), (copyStatus = false)">
        <div class="left leftTable" style="position: relative" id="leftTable" ref="leftTable">
          <div style="text-align: left">
            <div>
              <!-- <p>1111111</p> -->
              <div ref="colWidthBox" style="display: inline-flex; position: relative; text-align: center; background: #ccc" v-if="tabulation.length != 0">
                <div style="width: 50px; border: 1px solid; background: #ccc"><i class="el-icon-caret-right"></i></div>
                <div @click="imageList(idx, 1)" ref="colWidth" :id="'colWidth' + idx" style="width: 40px; border: 1px solid; position: relative" class="colWidth" v-for="(item, idx) in tabulation[tabulation.length - 1].arr" :key="idx">
                  {{ idx + 1 }}
                  <div class="baseRowColWidth" @mousedown="widthClick(idx, $event)" @mouseup="wdMouseUp(idx, $event)" @contextmenu.stop.prevent="heightRightClick(idx, $event, 2)"></div>
                </div>
                <div id="widthDashed" style="position: absolute; height: 800px; border: 1px dashed; display: none"></div>
              </div>
            </div>
            <div style="position: relative; display: flex; text-align: center" class="table-box" ref="tableBoxY" v-if="show3" @scroll="handleScroll">
              <div v-if="tabulation.length != 0 && show3" class="rowHeightBox" ref="rowHeightBox">
                <div ref="rowHeight" @click="imageList(idx, 0)" style="width: 50px; border: 1px solid; height: 22px; line-height: 22px; background: #ccc; position: relative" :id="'rowHeight' + idx" class="rowHeight" v-for="(item, idx) in tabulation" :key="idx">
                  {{ idx + 1 }}
                  <div class="baseRowHeight" style="" ref="baseRowHeight" @mousedown="heightClick(idx, $event)" @contextmenu.stop.prevent="heightRightClick(idx, $event, 1)"></div>
                </div>
              </div>
              <!-- style="transform:scale(0.5)"  transform:scale(0.7)-->
              <div style="position: relative">
                <table class="table mainTable" ref="tableDesign" v-if="refreshStatus">
                  <tr v-for="(item, idx) in tabulation" :key="idx" class="table-tr" ref="tableTr">
                    <td v-for="(i, id) in item.arr" :style="[i.style]" :key="id" ref="tableTd" :class="{ 'pre-wrap': i.name.indexOf('\n') != -1 }" @blur="nameInput(idx, id, $event.target.innerText, $event, i)" @input="tdInput(idx, id, $event.target.innerText, $event, i)" :contentEditable="i.attributeTypes == 1" class="table-td" :rowspan="i.row" :colspan="i.span" style="border: 1px solid rgba(0, 0, 0, 0.2); -webkit-touch-callout: none" @mousedown="onmousedownClick(idx, id, $event)" @contextmenu.stop.prevent="tdRightClick(idx, $event)">
                      <span v-if="i.attributeTypes == 1 && i.status == false && i.name.length > 0 && i.checkout == false">{{ i.name }}</span>
                      <el-input :class="{ 'form-td-input': i.style.background == '#e4e7ed' }" v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" @blur="nameBlur(idx, id, i.name)" @input="nameChange(idx, id, i.name)" size="mini"></el-input>
                      <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
                      <span v-if="i.attributeTypes == 3" style="background: #ccc; display: inline-flex" :style="{ width: i.signatureDate.width + 'px', height: i.signatureDate.height + 'px' }">签名区</span>
                      <el-select :class="{ 'form-td-input': i.style.background == '#e4e7ed' }" clearable v-if="i.attributeTypes == 2" size="mini" ref="scroll" v-model="i.name" placeholder="请选择">
                        <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                      </el-select>
                    </td>
                  </tr>
                </table>

                <div id="rectangular" ref="rectangular"></div>
                <div v-show="shortDmOrientation == 1" ref="endlongLeft" style="position: absolute; top: 0px; background: rgba(6, 6, 6, 0.1)"></div>
                <div v-show="shortDmOrientation == 1" ref="endlongTop" style="position: absolute; top: 860px; left: 0px; width: 605px; background: rgba(6, 6, 6, 0.1)"></div>
                <div v-show="shortDmOrientation == 2" ref="abscissaLeft" style="position: absolute; top: 0px; height: 100%; background: rgba(6, 6, 6, 0.1)"></div>
                <div v-show="shortDmOrientation == 2" ref="abscissaTop" style="position: absolute; top: 605px; left: 0px; width: 860px; background: rgba(6, 6, 6, 0.1)"></div>
                <div
                  v-show="rightEditStatus"
                  ref="rightEdit"
                  style="position: absolute;width200px;top: 0;left:20px;background: #fff;box-shadow: 0px 0px 2px 1px;text-align: center;
                                border-radius: 6px;z-index: 9999;"
                >
                  <div class="arrow" style="border-bottom: 7px solid rgba(0, 0, 0, 0); border-right: 7px solid #000; border-left: 7px solid rgba(0, 0, 0, 0); border-top: 7px solid rgba(0, 0, 0, 0); width: 0px; height: 0px; position: relative; top: 0px; left: -14px"></div>

                  <div style="padding: 8px">
                    <el-button type="danger" size="mini" @click="deleteRows">删除</el-button>
                  </div>
                  <div style="padding: 8px">
                    <!-- <el-button type="primary" size="mini" @click="insertRows">插入</el-button> -->
                  </div>
                </div>
                <div ref="tdRightEdit" v-show="copyStatus" style="position: absolute;width200px;top: 0;left:20px;background: #fff;box-shadow: 0px 0px 2px 1px;text-align: center;border-radius: 6px;z-index: 9999;">
                  <div style="padding: 8px">
                    <el-button type="primary" @click.stop="copy" size="mini">复制</el-button>
                  </div>
                  <div style="padding: 8px">
                    <el-button type="primary" @click.stop="stickup" size="mini">粘贴</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div style="background: #ccc; line-height: 22px; margin-bottom: 8px; text-align: center">选择区域</div>
          <div class="right-row-span" v-if="!ranksStatus">
            <span>行</span>
            <el-input size="mini" class="right-input" disabled v-model="row"></el-input>
            <span>列</span>
            <el-input size="mini" class="right-input" disabled v-model="span"> </el-input>
          </div>
          <div class="right-row-span" v-if="ranksStatus">
            <span v-if="ranksType == 0">行</span>
            <el-input v-if="ranksType == 0" size="mini" class="right-input" disabled v-model="ranksIndex"></el-input>
            <span v-if="ranksType == 0">行高</span>
            <el-input v-if="ranksType == 0" size="mini" class="right-input" @blur="ranksBlur(ranksData, 0)" v-model="ranksData"> </el-input>
            <span v-if="ranksType == 1">列</span>
            <el-input v-if="ranksType == 1" size="mini" class="right-input" disabled v-model="ranksIndex"></el-input>
            <span v-if="ranksType == 1">列宽</span>
            <el-input v-if="ranksType == 1" size="mini" class="right-input" @blur="ranksBlur(ranksData, 1)" v-model="ranksData"> </el-input>
          </div>
          <div v-if="!ranksStatus" style="margin-top: 10px; background: #ccc; line-height: 22px; margin-bottom: 8px; text-align: center">单元格属性</div>
          <div class="right-row-span" v-if="row.length != 0 && span.length != 0 && !ranksStatus">
            <span>类型</span>
            <el-select size="mini" v-model="attributeTypes" ref="upSelect" @change="attributeTypesChange" placeholder="请选择" style="width: 100px">
              <el-option label="文本" value="1"></el-option>
              <el-option label="下拉框" value="2"></el-option>
              <el-option label="签名区" value="3"></el-option>
            </el-select>
          </div>
          <div class="right-row-span" v-show="attributeTypes == 1 && !ranksStatus">
            <el-checkbox v-model="checked" @change="checkedChange">可编辑</el-checkbox>
            <el-checkbox v-if="checked" v-model="checkout" @change="checkoutChange">启用校验</el-checkbox>
            <br />
            <span style="margin-top: 6px" v-if="checked">校验类型</span>
            <el-select size="mini" v-if="checked" v-model="checkType" @change="checkTypeChange" placeholder="请选择" style="margin-top: 6px; width: 130px">
              <el-option label="纯数字" value="1"></el-option>
              <el-option label="小数" value="2"></el-option>
              <el-option label="金额" value="3"></el-option>
              <el-option label="日期" value="4"></el-option>
              <el-option label="电话号码" value="5"></el-option>
              <el-option label="身份证" value="6"></el-option>
            </el-select>
          </div>
          <div class="right-row-span" v-show="attributeTypes == 2 && !ranksStatus" style="height: 220px; overflow: auto">
            <div v-for="(item, idx) in optionContent" :key="idx" style="margin-top: 6px">
              <span>选项{{ idx + 1 }}</span>
              <el-input size="mini" class="right-input" style="width: 80px" @input="optionContentChange(idx, item.label)" v-model="item.label"></el-input>
              <el-button @click="optionAdd" style="margin: 0" icon="el-icon-plus" size="mini" circle></el-button>
              <el-button v-if="idx != 0" @click="optionRemove(idx)" style="margin: 0" icon="el-icon-close" size="mini" circle></el-button>
            </div>
          </div>
          <div class="right-row-span" v-show="attributeTypes == 3 && !ranksStatus" style="height: 220px; overflow: auto">
            <div>
              <span>内容</span>
              <el-input size="mini" class="right-input" style="width: 156px" @input="contentChange" v-model="signatureDate.content"></el-input>
            </div>
            <div>
              <span>签名区：</span>
              <div style="margin-left: 3em">
                <span>宽</span>
                <el-input-number size="mini" v-model="signatureDate.width" @change="widthChange" :min="36" :max="100" label="描述文字"></el-input-number>
              </div>
              <div style="margin-left: 3em">
                <span>高</span>
                <el-input-number size="mini" style="margin-top: 6px" v-model="signatureDate.height" @change="heightChange" :min="18" :max="100" label="描述文字"></el-input-number>
              </div>
            </div>
            <div>
              <span>签名人：</span>
              <div style="margin-left: 3em">
                <el-select size="mini" v-model="signatureDate.signatureUnit" @change="signatureUnitChange" placeholder="请选择" style="margin-top: 6px; width: 150px">
                  <el-option v-for="item in signatureUnitList" :label="item.roleName" :key="item.pkId" :value="item.pkId"></el-option>
                </el-select>
              </div>
              <div style="margin-left: 3em">
                <el-select size="mini" v-model="signatureDate.signer" @change="signerChange" placeholder="请选择" style="margin-top: 6px; width: 150px">
                  <el-option v-for="item in signerList" :label="item.roleName" :value="item.pkId" :key="item.pkId"></el-option>
                </el-select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="custom-btn">
        <el-button type="success" size="mini" @click="generate">生成表格</el-button>
        <el-button type="info" size="mini" @click="show3 = false">取消</el-button>
      </div>
    </el-dialog>
    <div ref="previewTableImg" style="padding-top: 20px; position: fixed; left: -99999px">
      <!-- border-collapse:collapse;border:none -->
      <table style="border-collapse: collapse; overflow: auto; margin: 0 auto">
        <tr v-for="(item, idx) in tabulationArr" :key="idx" style="">
          <td style="box-sizing: content-box; border: none; margin: 0; padding: 0; border: none" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <div v-if="i.attributeTypes == 1 && i.checkout == false" :class="{ 'pre-wrap': i.name.indexOf('\n') != -1 }">
              {{ i.name }}
            </div>
            <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" disabled v-model="i.name" size="mini"></el-input>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
            <el-select v-if="i.attributeTypes == 2" clearable size="mini" v-model="i.name" disabled placeholder="请选择">
              <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
            </el-select>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import utils from "@/utils/util";
export default {
  props: {
    tablesDialog: {
      type: Boolean,
      default: false
    },
    fkOrgId: "",
    pkId:""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      contentData: [], // 预览表格内容
      headerData: [], // 预览表格表头
      loading: false,
      maxHeight: 0,
      show1: false,
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      tableData: [],
      inpData: {
        tableName: "",
        itemName: ""
      },
      searchData: {
        tableName: "",
        itemName: ""
      },
      form: {
        pkId: "",
        remark: "",
        sortval: 0,
        tableData: "",
        tableExpand: "",
        tableHead: "",
        tableHtml: "",
        tableName: ""
      },
      a1: false,
      a2: 1,
      itemType:[],
      formLabelWidth: "120px",
      addTitle: "新增单位工程分类",
      rules: {
        tableName: [
          {
            required: true,
            message: "表格名称不能为空",
            trigger: ["change", "blur"]
          }
        ],
        sortval: [
          {
            required: true,
            message: "排序值不能为空",
            trigger: ["change", "blur"]
          }
        ],
        tableHtml: [
          {
            required: true,
            message: "表格内容不能为空",
            trigger: ["change", "blur"]
          }
        ],
        tableType: [
          {
            required: true,
            message: "表格类型不能为空",
            trigger: ["change", "blur"]
          }
        ]
      },
      showType: null,
      show2: false,
      formDate: null,
      projectType: [],
      loading: false,
      professionalType: [],
      /// ////////////////
      show3: false,

      // show4: false,
      // 表格数据
      tabulation: [
        {
          // status:false,
          arrr: [
            {
              name: "", // 内容
              w: "", // 宽
              h: "", // 高
              x: "", // x坐标
              y: "", // y坐标
              row: 1, // 单元格行
              span: 1, // 单元格列
              status: false, // 是否删除
              begin_x: 0, // x开始坐标
              end_x: 0, // x结束坐标
              begin_y: 0, // y开始坐标
              end_y: 0, // y结束坐标
              attributeTypes: "", // 类型 1文本 2 下拉框 3 签名区 默认类型为文本
              disabled: true, // 是否可编辑 默认可编辑
              checkout: false, // 是否校验 默认不校验
              checkType: "", // 校验类型 1纯数字 2小数 3金额 4日期 5 电话号码 6身份证
              option: [], // 类型为下拉时取的下拉数据
              signatureDate: {
                // 签名区
                content: "", // 内容
                width: "", // 宽度
                height: "", // 高度
                signatureUnit: "", // 签名单位
                signer: "", // 签名人
                name: ""
              },
              style: {
                // 样式
                border: "1px solid rgba(0,0,0,0.2)",
                backgroundClip: "padding-box",
                width: "50px",
                height: "30px",
                position: "relative",
                textDecoration: "none"
              }
            }
          ]
        }
      ],
      idx: "",
      id: "",
      row: "",
      span: "",
      // characterStatus: false,

      name: "",
      /// ////////////////
      start_x: 0,
      start_y: 0,
      sizeArr: [
        { label: "8", value: "12" },
        { label: "9", value: "13" },
        { label: "10", value: "14" },
        { label: "11", value: "15" },
        { label: "12", value: "16" },
        { label: "14", value: "18" },
        { label: "16", value: "20" },
        { label: "18", value: "22" },
        { label: "20", value: "24" },
        { label: "22", value: "26" },
        { label: "24", value: "28" },
        { label: "26", value: "30" },
        { label: "28", value: "32" },
        { label: "36", value: "40" },
        { label: "48", value: "52" },
        { label: "72", value: "76" }
      ],
      typeface: "", // 字体类型
      fontSize: "", // 字体大小
      attributeTypes: "", // 单元格属性类型
      checked: true, // 是否可编辑
      checkout: false, // 是否校验
      checkType: "", // 校验类型
      optionContent: [{ label: "" }], // "下拉选项"
      signatureDate: {
        // 签名区
        content: "", // 内容
        width: "", // 宽度
        height: "", // 高度
        signatureUnit: "", // 签名单位
        signer: "" // 签名人
      },
      fontWeight: "", // 加粗按钮回显判定值
      fontStyle: "", // 文字正斜回显判断值
      textAlign: "", // 左右中显示回显判断值
      textDecoration: "", // 左右中显示回显判断值
      verticalAlign: "", // 上中下显示回显判断值
      shortDmOrientation: "1", // 纸张方向 1 竖向 2 横向
      tabulationArr: [],
      signatureUnitList: [], // 签名人单位下拉
      signerList: [], //
      splitRow: "1",
      splitSpan: "1",
      pvwWidth: "787",
      top_y: 0,
      left_x: 0,
      fullscreen: false,
      rightEditStatus: false,
      rightEditIdx: 0,
      refreshStatus: true,
      copyData: null,
      copyStatus: false,
      sta: 0,
      imageUrl: "",
      srcList: [],
      redactStatus: false,
      ranksStatus: false,
      ranksType: 0,
      ranksIndex: 0,
      ranksData: "",
      ranksEdit: false,
      ranksCode: 0,
      ranks: {
        ranksLeft: "",
        ranksCode: ""
      },
      noSaveb:{
        left:0,
        right:0,
        bottom:0,
        top:0,
      }
    };
  },
  methods: {
    int() {
      let data = { ...this.page, ...this.searchData, fkProjectBidId: this.pkId };
      this.$api.searchprocessTablePage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    handleClose() {
      this.$emit("update:tablesDialog", false);
    },
    search() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.int();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageNum = 1;
      this.page.pageSize = val;
      this.int();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.int();
    },
    // 清空搜索栏
    cleanSearchData() {
      this.inpData = {
        tableName: "",
        itemName: ""
        };
      this.searchData = {
        tableName: "",
        itemName: ""
        };
      this.page = { pageSize: 10, pageNum: 1 };
    },
    fontUnderline() {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            if (i.style.textDecoration == "underline") {
              i.style.textDecoration = "none";
              this.textDecoration = "none";
            } else {
              i.style.textDecoration = "underline";
              this.textDecoration = "underline";
            }
          }
        });
      });
    },
    // 禁止输入e和.
    channelInputLimit(e) {
      const key = e.key;
      if (key === "e" || key === ".") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    ranksCodeClick(val) {
      this.ranksCode = val;
      if (this.ranksCode == 0) {
        this.ranks.top = 20;
        this.ranks.left = 20;
      }
      if (this.ranksCode == 1) {
        this.ranks.top = 30;
        this.ranks.left = 30;
      }
      if (this.ranksCode == 2) {
        this.ranks.top = 10;
        this.ranks.left = 10;
      }
    },
    marginNumBer() {
      this.ranks.left = this.noSaveb.left
      this.ranks.right = this.noSaveb.right
      this.ranks.top = this.noSaveb.top
      this.ranks.bottom = this.noSaveb.bottom
      this.noSaveb={
        left:0,
        right:0,
        bottom:0,
        top:0,
      }
      this.ranksCode = 3;
      this.ranksEdit = false;
    },
    imageList(idx, id) {
      this.ranksData = id == 0 ? this.$refs.rowHeight[idx].offsetHeight : this.$refs.colWidth[idx].offsetWidth;
      this.ranksIndex = idx + 1;
      this.ranksType = id;
      this.ranksStatus = true;
    },
    ranksBlur(val, type) {
      val = val.length == 0 ? 20 : val;
      if (type == 0) {
        if (val < 20) {
          return (this.ranksData = 20);
        }
        // console.log(this.$refs.tableTd[0].offsetHeight)
        // console.log()
        this.$refs.rowHeight[this.ranksIndex - 1].style.height = val + "px";
        this.$refs.rowHeight[this.ranksIndex - 1].style.lineHeight = val + "px";
        this.tabulation[this.ranksIndex - 1].arr.forEach(item => {
          item.style.height = val + "px";
        });

        this.$nextTick(() => {
          this.deviation(val);
        }, 1000);
      } else {
        this.$refs.colWidth[this.ranksIndex - 1].style.width = val + "px";
        this.tabulation.forEach(item => {
          item.arr[this.ranksIndex - 1].style.width = val + "px";
        });
      }

      this.widthFunction();
      this.coordinates();
      // this.highWide();
      // this.widthFunction();
    },
    deviation(val) {
      let data1 = this.$refs.tableTd[this.ranksIndex * 30 - 5].offsetHeight;
      if (data1 > val) {
        this.ranksData = data1;
        this.$refs.rowHeight[this.ranksIndex - 1].style.height = data1 + "px";
        this.$refs.rowHeight[this.ranksIndex - 1].style.lineHeight = data1 + "px";
        this.tabulation[this.ranksIndex - 1].arr.forEach(item => {
          item.style.height = data1 + "px";
        });
        this.widthFunction();
        this.coordinates();
      }
    },
    handleScroll(val) {
      console.log("=============================>");
      const box = this.$refs.leftTable;
      console.log(box.scrollLeft);
      const rowHeightBox = this.$refs.rowHeightBox;
      rowHeightBox.style.left = box.scrollLeft + "px";
      console.log("=============================>");
      // this.$nextTick(()=>{
      //   this.$refs.scroll.forEach(item => {
      //     item.blur();
      //   });
      // })
      if (this.$refs.scroll != undefined) {
        this.$refs.scroll.forEach(item => {
          item.blur();
        });
      }
    },

    tdInput(idx, id, val, e, i) {
      // return
      // console.log(1);
      if (e.target.innerHTML.indexOf("<img") != -1 || e.target.innerHTML.indexOf("<table") != -1) {
        val = "";
        e.target.innerHTML = "";
      }
      // console.log(val)
      // return console.log(e.target.innerText)
      let s = 0;
      if (idx == 0) {
        s = 0;
      } else {
        s = idx * this.tabulation[idx].arr.length;
        s = s + 1;
      }
      s = s + id;
      const wIndex = i.style.height.lastIndexOf("px");
      const wd = i.style.height.substring(wIndex, i.style.height);
      const height = this.$refs.tableTd[s].offsetHeight;
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(wd);
      console.log(height);
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");
      if (height > wd) {
        this.$refs.rowHeight[idx].style.height = height + "px";
        this.$refs.rowHeight[idx].style.lineHeight = height + "px";
        this.tabulation[idx].arr.forEach(item => {
          item.style.height = height + "px";
          item.minHeight = height;
        });
      }
      this.coordinates();
    },
    nameInput(idx, id, val, e, i) {
      if (this.tabulation[idx].arr[id].attributeTypes != 1 || i.attributeTypes != 1) {
        e.target.innerText = e.target.innerText.trim();
        return;
      }
      this.tabulation[idx].arr[id].name = val;
      if (i.attributeTypes == 1 && i.checkout == false && e.target.innerText.trim().length > 0) {
        e.target.innerText = val;
      }
    },
    tdBlur(item, id, val, e) {
      if (item.arr[id].checkout == true) {
        return;
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
    },
    nameChange(idx, id, val) {
      //  纯数字
      if (this.tabulation[idx].arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        this.tabulation[idx].arr[id].name = val;
      }
      // 小数
      if (this.tabulation[idx].arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        this.tabulation[idx].arr[id].name = val;
      }
      // 金额
      if (this.tabulation[idx].arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        this.tabulation[idx].arr[id].name = val;
      }
      // // 日期
      if (this.tabulation[idx].arr[id].checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        this.tabulation[idx].arr[id].name = val;
      }
      // 电话号码
      if (this.tabulation[idx].arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            this.tabulation[idx].arr[id].name = "";
          } else {
            this.tabulation[idx].arr[id].name = val;
          }
        }
      }
      // 身份证
      if (this.tabulation[idx].arr[id].checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        this.tabulation[idx].arr[id].name = val;
      }
    },
    tdNameChange(item, id, val) {
      //  纯数字
      if (item.arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        item.arr[id].name = val;
      }
      // 小数
      if (item.arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        item.arr[id].name = val;
      }
      // 金额
      if (item.arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        item.arr[id].name = val;
      }
      // // 日期
      if (item.checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        item.arr[id].name = val;
      }
      // 电话号码
      if (item.arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          } else {
            item.arr[id].name = val;
          }
        }
      }
      // 身份证
      if (item.checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        item.arr[id].name = val;
      }
    },
    nameBlur(idx, id, val) {
      // 手机号
      if (this.tabulation[idx].arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            this.tabulation[idx].arr[id].name = "";
          }
        }
      }

      // 日期
      if (this.tabulation[idx].arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            this.tabulation[idx].arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (this.tabulation[idx].arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            this.tabulation[idx].arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    },
    tdNameBlur(item, id, val) {
      // 手机号
      if (item.arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          }
        }
      }

      // 日期
      if (item.arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (item.arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    },
    textVerify(idx, id, val) {
      val = val.replace(/\D/g, "");
      console.log(val);
      this.tabulationArr[idx].arr[id].name = val;
    },
    searchSysAuditRole() {
      // customSysAuditRole
      this.$api.customSysAuditRole({ workflowType: 9 }).then(res => {
        if (res.code == 200) {
          this.signatureUnitList = res.data;
        }
      });
    },
    // 清除背景色
    clearBackground() {
      this.tabulation.forEach((item, idx) => {
        item.arr.forEach((i, id) => {
          i.style.background = "none";
        });
      });
    },
    // 打印
    print() {
      // htmlToPdf.getPdf('#previewTable', "打印", false, this.shortDmOrientation) //download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
      //       .then((res) => {
      //         printJS({ printable: res, type: "pdf" });

      //         })

      const printContent = this.$refs.previewTable;
      // 获取dom 宽度 高度
      const width = printContent.clientWidth;
      const height = printContent.clientHeight;
      // 创建一个canvas节点
      const canvas = document.createElement("canvas");
      const scale = 4; // 定义任意放大倍数，支持小数；越大，图片清晰度越高，生成图片越慢。previewTable
      canvas.width = width * scale; // 定义canvas 宽度 * 缩放
      canvas.height = height * scale; // 定义canvas高度 *缩放
      canvas.style.width = width * scale + "px";
      canvas.style.height = height * scale + "px";
      canvas.getContext("2d").scale(scale, scale); // 获取context,设置scale
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // 获取滚动轴滚动的长度
      const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft; // 获取水平滚动轴的长度
      console.log("xcxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(canvas.style.width);
      console.log(scrollLeft);
      console.log("xcxxxxxxxxxxxxxxxxxxxxxxxxxx");
      html2canvas(printContent, {
        canvas,
        backgroundColor: null,
        useCORS: true,
        windowHeight: document.body.scrollHeight,
        scrollX: -scrollLeft, // 解决水平偏移问题，防止打印的内容不全
        scrollY: -scrollTop
      })
        .then(canvas => {
          const url = canvas.toDataURL("image/png");
          printJS({
            printable: url,
            type: "image",
            documentTitle: "", // 标题
            style: "@page{size:auto;margin: 0cm 1cm 0cm 1cm;}" // 去除页眉页脚
          });
        })
        .catch(err => {
          console.error(err);
        });
    },
    // 预览效果
    previewEdition() {
      this.coordinates();
      this.clearBackground();
      const w = 0;
      const h = 0;
      let x = 0;
      let y = 0;
      if (this.shortDmOrientation == 1) {
        x = 787;
        y = 1013;
        this.pvwWidth = "787";
      } else {
        x = 1013;
        y = 787;
        this.pvwWidth = "1013";
      }
      const arr = JSON.stringify(this.tabulation);

      this.tabulationArr = JSON.parse(arr);
      this.tabulationArr.forEach(item => {
        const xx = 0;
        item.arr.forEach((i, s) => {
          if (i.x > x || i.y > y) {
            i.style.display = "none";
          }
          i.style.background = "none";
          if (i.style.borderLeft == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
          }
          if (i.style.borderRight == "2px solid #1f2d3d") {
            i.style.borderRight = "1px solid #1f2d3d";
          }
          if (i.style.borderTop == "2px solid #1f2d3d") {
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.borderBottom == "2px solid #1f2d3d") {
            i.style.borderBottom = "1px solid #1f2d3d";
          }
          if (i.style.border == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
            i.style.borderRight = "1px solid #1f2d3d";
            i.style.borderBottom = "1px solid #1f2d3d";
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.border == "1px solid rgba(0,0,0,0.2)") {
            i.style.border = "none";
          }
          if (i.style.borderLeft == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderLeft = "none";
          }
          if (i.style.borderRight == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderRight = "none";
          }
          if (i.style.borderTop == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderTop = "none";
          }
          if (i.style.borderBottom == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderBottom = "none";
          }
        });
      });
      this.show2 = true;
      if (this.ranksCode == 0) {
        this.ranks.top = 30;
        this.ranks.left = 30;
      }
      if (this.ranksCode == 1) {
        this.ranks.top = 100;
        this.ranks.left = 100;
      }
      if (this.ranksCode == 2) {
        this.ranks.top = 10;
        this.ranks.left = 10;
      }
    },
    // 竖向
    vertical() {
      this.clearBackground();
      this.shortDmOrientation = "1";
      this.coordinates();
    },
    // 横向
    crosswise() {
      this.clearBackground();
      this.shortDmOrientation = "2";
      this.coordinates();
    },
    // 设置文字类型
    typefaceChange(val) {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.fontFamily = val;
          }
        });
      });
    },
    // 设置文字大小
    fontSizeChange(val) {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.fontSize = val + "px";
          }
        });
      });
    },
    // 文字加粗
    fontWeightClick() {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            // i.style.fontSize = val + "px";
            if (i.style.fontWeight == "bolder") {
              i.style.fontWeight = 400;
              this.fontWeight = "400";
            } else {
              i.style.fontWeight = "bolder";
              this.fontWeight = "bolder";
            }
          }
        });
      });
    },
    // 文字斜体
    fontStyleClick() {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            if (i.style.fontStyle == "italic") {
              i.style.fontStyle = "normal";
              this.fontStyle = "normal";
            } else {
              i.style.fontStyle = "italic";
              this.fontStyle = "italic";
            }
          }
        });
      });
    },
    // 内容居左
    textLeft() {
      this.textAlign = "left";
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.textAlign = "left";
          }
        });
      });
    },
    // 内容居中
    textCenter() {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.textAlign = "center";
          }
        });
      });
      this.textAlign = "center";
    },
    // 内容居右
    textRight() {
      this.textAlign = "right";
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.textAlign = "right";
          }
        });
      });
    },
    // 文字居上
    textUp() {
      this.verticalAlign = "top";
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.verticalAlign = "top";
          }
        });
      });
    },
    // 文字垂直居中
    textMiddle() {
      this.verticalAlign = "middle";
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.verticalAlign = "middle";
          }
        });
      });
    },
    // 文字垂直居下
    textDown() {
      this.verticalAlign = "bottom";
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.style.verticalAlign = "bottom";
          }
        });
      });
    },
    // 无边框
    noBorder() {
      console.log(this.tabindex);
      this.tabulation.forEach((item, idx) => {
        item.arr.forEach((i, id) => {
          if (i.style.background == "#e4e7ed") {
            i.border = "none";
            i.style.borderLeft = "1px solid rgba(0,0,0,0.2)";
            i.style.borderRight = "1px solid rgba(0,0,0,0.2)";
            i.style.borderTop = "1px solid rgba(0,0,0,0.2)";
            i.style.borderBottom = "1px solid rgba(0,0,0,0.2)";
            i.style.border = "1px solid rgba(0,0,0,0.2)";
          }
        });
      });
    },
    // 下边框
    borderBottom() {
      this.tabulation.forEach((item, idx) => {
        item.arr.forEach((i, id) => {
          if (i.style.background == "#e4e7ed") {
            this.tabulation[idx - 1].arr[id].style.borderBottom = "none";
            i.style.borderBottom = "2px solid #1f2d3d";
          }
        });
      });
    },
    // 上边框
    borderTop() {
      let status = true;
      this.tabulation.forEach((item, idx) => {
        if (status) {
          item.arr.forEach((i, id) => {
            if (i.style.background == "#e4e7ed") {
              status = false;
              i.style.borderTop = "2px solid #1f2d3d";
            }
          });
        }
      });
    },
    // 左边框
    borderLeft() {
      this.tabulation.forEach((item, idx) => {
        let status = true;
        item.arr.forEach((i, id) => {
          if (status) {
            if (i.style.background == "#e4e7ed") {
              status = false;
              i.style.borderLeft = "2px solid #1f2d3d";
            }
          }
        });
      });
    },
    // 右边框
    borderRight() {
      // this.tabulation.forEach((item, idx) => {
      //   item.arr.forEach((i, id) => {
      //     if (i.style.background == "#e4e7ed") {
      //       this.tabulation[idx].arr[id - 1].style.borderRight = "none";
      //       i.style.borderRight = "2px solid #1f2d3d";
      //     }
      //   });
      // });
      this.tabulation.forEach((item, idx) => {
        let status = true;
        item.arr.forEach((i, id) => {
          if (status) {
            if (i.style.background == "#e4e7ed") {
              // status = false;

              if (i.span == 1 && i.style.display != "none") {
                this.tabulation[idx].arr[id - 1].style.borderRight = "none";
              }
              i.style.borderRight = "2px solid #1f2d3d";
            }
          }
        });
      });
    },
    // 所有边框
    allBorder(val) {
      console.log(val);
      this.tabulation.forEach((item, idx) => {
        item.arr.forEach((i, id) => {
          if (i.style.background == "#e4e7ed") {
            i.style.border = "2px solid #1f2d3d";
          }
        });
      });
    },
    // 合并单元格
    combine() {
      let amount = 0;
      let row = 0;
      let span = 0;
      // 拆分合并
      this.tabulation.forEach((item, idx) => {
        item.arr.forEach((i, id) => {
          if (i.style.background == "#e4e7ed") {
            amount = amount + 1;
            row = i.row;
            span = i.span;
            if (i.row > 1 || i.span > 1) {
              this.splitRow = i.row;
              this.splitSpan = i.span;
              this.idx = idx;
              this.id = id;
            }
          }
        });
      });

      if (amount <= 1 && row <= 1 && span <= 1) {
        return console.log("没有合并过的单个 单元格不能合并和拆解");
      }
      if (this.splitRow > 1 || this.splitSpan > 1) {
        const w = this.tabulation[this.idx].arr[this.id].style.width.lastIndexOf("px");
        const wd = this.tabulation[this.idx].arr[this.id].style.width.substring(w, this.tabulation[this.idx].arr[this.id].style.width);
        const h = this.tabulation[this.idx].arr[this.id].style.height.lastIndexOf("px");
        const hd = this.tabulation[this.idx].arr[this.id].style.height.substring(h, this.tabulation[this.idx].arr[this.id].style.height);
        const rowTotal = this.splitRow + this.idx;
        const spanTotal = this.splitSpan + this.id;
        this.tabulation[this.idx].arr[this.id].style.width = this.$refs.colWidth[this.id].offsetWidth + "px";
        this.tabulation[this.idx].arr[this.id].style.height = this.$refs.rowHeight[this.idx].offsetHeight + "px";
        this.tabulation[this.idx].arr[this.id].span = 1;
        this.tabulation[this.idx].arr[this.id].row = 1;
        let idx = 0;

        this.tabulation.forEach((item, i) => {
          if (i >= this.idx) {
            let id = 0;
            if (this.splitRow == idx) {
              return;
            }
            idx = idx + 1;
            item.arr.forEach((items, e) => {
              if (this.splitSpan <= id) {
                return;
              }
              if (e >= this.id) {
                items.style.display = "table-cell";
                id = id + 1;
              }
            });
          }
        });
        this.splitRow = 1;
        this.splitSpan = 1;
        console.log("111111111111111111");
        console.log(this.idx + 1);
        console.log(this.id + 1);

        setTimeout(() => {
          this.defer();
        }, 50);
      } else {
        // 合并单元格
        let row = 0; // 行
        let span = 0; // 列
        let status = true; // 状态
        let w = 0; // 宽度
        let h = 0; // 高度
        let withStatus = true;
        let rows = 0; // 所占行数
        let spans = 0; // 所占列数
        this.tabulation.forEach((item, idx) => {
          item.arr.forEach((i, id) => {
            if (status) {
              if (i.style.background == "#e4e7ed") {
                status = false;
                span = id;
                row = idx;
              }
            }
          });
        });
        for (let i = 0; i < this.tabulation.length; i++) {
          if (this.tabulation[i].arr[span].style.background == "#e4e7ed") {
            const index = this.tabulation[i].arr[span].style.height.lastIndexOf("px");
            const number = this.tabulation[i].arr[span].style.height.substring(index, this.tabulation[i].arr[span].style.height);
            rows = rows + 1;
            h = h + parseInt(number);
          }
        }
        for (let i = 0; i < this.tabulation.length; i++) {
          if (withStatus) {
            for (let e = 0; e < this.tabulation[i].arr.length; e++) {
              if (this.tabulation[i].arr[e].style.background == "#e4e7ed") {
                withStatus = false;
                const index = this.tabulation[i].arr[e].style.width.lastIndexOf("px");
                const number = this.tabulation[i].arr[e].style.width.substring(index, this.tabulation[i].arr[e].style.width);
                w = w + parseInt(number);
                spans = spans + 1;
                if (e != span) {
                  row = i;
                  this.tabulation[i].arr[e].style.display = "none";
                  this.tabulation[i].arr[e].mergeSpan = span;
                }
              }
            }
          }
        }

        this.tabulation.forEach((item, idx) => {
          if (idx != row) {
            item.arr.forEach((i, id) => {
              if (i.style.background == "#e4e7ed") {
                i.style.display = "none";
                i.mergeRow = row;
                i.mergeSpan = span;
              }
            });
          }
        });
        this.tabulation[row].arr[span].style.width = w + "px";
        this.tabulation[row].arr[span].style.height = h + "px";
        this.tabulation[row].arr[span].row = rows;
        this.tabulation[row].arr[span].span = spans;
      }
      this.coordinates();
    },
    defer() {
      let s = 0;
      if (this.idx == 0) {
        s = 0;
      } else {
        s = this.idx * this.tabulation[this.idx].arr.length;
      }
      s = s + this.id;
      let i = this.tabulation[this.idx].arr[this.id];
      const wIndex = i.style.height.lastIndexOf("px");
      const wds = i.style.height.substring(wIndex, i.style.height);
      const height = this.$refs.tableTd[s].offsetHeight;
      if (height > wds) {
        this.$refs.rowHeight[this.idx].style.height = height + "px";
        this.$refs.rowHeight[this.idx].style.lineHeight = height + "px";
        this.tabulation[this.idx].arr.forEach(item => {
          item.style.height = height + "px";
          item.minHeight = height;
        });
      }
      this.coordinates();
    },
    // 全屏事件  fullscreen 控制是否全屏默认false
    handleFullScreen() {
      const divElement = document.getElementById("app");
      // console.log(document.querySelectorAll(".el-dialog")[7]);
      const bodyEdit = document.querySelectorAll(".design-table-edit")[0];
      const operate = document.querySelectorAll(".operate")[0];
      const customTable = document.querySelectorAll(".custom-table")[0];
      this.fullscreen = !this.fullscreen;
      if (this.fullscreen) {
        bodyEdit.style.margin = 0;
        bodyEdit.style.width = "100%";
        // divElement.offsetHeight + "px ";
        bodyEdit.style.height = "100%";
        bodyEdit.style.top = 0;
        bodyEdit.style.left = 0;
        customTable.style.height = divElement.offsetHeight - operate.offsetHeight - 150 + "px ";
      } else {
        bodyEdit.style.margin = "0 auto";
        bodyEdit.style.marginTop = "15vh";
        bodyEdit.style.width = "80%";
        bodyEdit.style.height = "";
        customTable.style.height = "500px";
      }
    },
    // 单元格属性类型
    attributeTypesChange(val) {
      // return console.log(this.id, this.idx)
      this.refreshStatus = false;
      // console.log(this.tabulation[this.idx].arr[this.id].name)
      // return
      // this.tabulation.forEach(item => {
      //   item.arr.forEach(i => {
      //     if (i.style.background == "#e4e7ed") {
      //       // i.attributeTypes = val;
      //       console.log(i)
      //     }
      //   });
      // });
      console.log(val);
      if (val == 3 || val == 2) {
        this.tabulation[this.idx].arr[this.id].name = "";
        //
        // this.tabulation.forEach(item => {
        //   item.arr.forEach(i => {
        //     if (i.style.background == "#e4e7ed") {
        //       i.name = "";
        //     }
        //   });
        // });
      }
      setTimeout(() => {
        this.refreshStatus = true;
        this.coordinates();
      }, 1);

      this.tabulation[this.idx].arr[this.id].attributeTypes = val;
    },
    // 是否可编辑
    checkedChange(val) {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.disabled = val;
          }
        });
      });
      if (val == false) {
        this.checkout = false;
        this.tabulation.forEach(item => {
          item.arr.forEach(i => {
            if (i.style.background == "#e4e7ed") {
              i.checkout = val;
            }
          });
        });
      }
    },
    // 启用校验
    checkoutChange(val) {
      this.refreshStatus = false;
      // // return
      // debugger
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.checkout = val;
            console.log("111111111111111111111111111111111111111111");
          }
        });
      });
      if (val == false) {
        this.tabulation.forEach(item => {
          item.arr.forEach(i => {
            if (i.style.background == "#e4e7ed") {
              i.status = true;
              console.log("2222222222222222222222222222222222222222222222222");
            }
          });
        });
        // this.refreshStatus = true
      } else {
        this.tabulation.forEach(item => {
          item.arr.forEach(i => {
            if (i.style.background == "#e4e7ed") {
              i.name = "";
              i.status = false;
              console.log("3333333333333333333333333333333333333333333333333333");
            }
          });
        });
      }
      this.$nextTick(() => {
        this.refreshStatus = true;
      });
    },
    // 校验类型
    checkTypeChange(val) {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            i.checkType = val;
          }
        });
      });
    },
    // 增加下拉选项
    optionAdd() {
      this.optionContent.push({ label: "" });
    },
    // 移除下拉选项
    optionRemove(idx) {
      this.optionContent.splice(idx, 1);
    },
    //  下拉选项输入事件
    optionContentChange(idx, val) {
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.style.background == "#e4e7ed") {
            const arr = JSON.stringify(this.optionContent);
            i.option = JSON.parse(arr);
          }
        });
      });
    },
    // 签名区 内容输入事件
    contentChange(val) {
      this.tabulation[this.idx].arr[this.id].signatureDate.content = val;
    },
    // 签名区 宽度输入事件
    widthChange(val) {
      this.tabulation[this.idx].arr[this.id].signatureDate.width = val;
    },
    // 签名区 高度输入事件
    heightChange(val) {
      this.tabulation[this.idx].arr[this.id].signatureDate.height = val;
    },
    // 签名区 签名名单
    signatureUnitChange(val) {
      this.signatureDate.signer = "";
      this.tabulation[this.idx].arr[this.id].signatureDate.signatureUnit = val;
      this.signatureUnitList.forEach(item => {
        if (val == item.pkId) {
          console.log(item);
          if (item.sysDefaultRoleList == null) {
            this.signerList = [];
          } else {
            this.signerList = item.sysDefaultRoleList;
          }
        }
      });
    },
    // 签名区 签名名单
    signerChange(val) {
      this.tabulation[this.idx].arr[this.id].signatureDate.signer = val;
    },
    // 设置表格行高
    heightClick(idx, event) {
      // console.log(event.clientY)
      // console.log("xx---xxx")
      // return console.log(this.$refs.baseRowHeight[idx])
      const h = this.$refs.rowHeight[idx].offsetHeight; // 获取 div 元素的高度，包含内边距（padding）和边框（border）
      const startY = event.clientY;
      event.preventDefault(); // 取消浏览器对当前事件的默认行为。
      event.stopPropagation(); // 阻止事件在DOM中继续传播，防止再触发定义在别的节点上的监听函数。
      // 鼠标拖动事件
      const _this = this;
      document.onmousemove = function(event) {
        const change = event.clientY - startY; // 鼠标移动的偏移值
        const moveLen = h + change; // 鼠标移动后，分割线节点元素的左边界的偏移值
        for (let i = 0; i < _this.tabulation[idx].arr.length; i++) {
          // let len = _this.tabulation[idx].arr[i].name.replaceAll("\n", "");
          let len = _this.tabulation[idx].arr[i].name.replace(/[\n]/g, "");
          len = len.replace("\n", "");
          if (_this.tabulation[idx].arr[i].name.indexOf("\n") != -1 && len.length != 0) {
            const str = _this.tabulation[idx].arr[i].name.split("\n").length - 1;
            if (str > 1 && _this.tabulation[idx].arr[i].minHeight != undefined && moveLen <= _this.tabulation[idx].arr[i].minHeight) {
              return false;
            }
          }
        }

        if (moveLen <= 22) {
          return;
        }
        _this.$refs.rowHeight[idx].style.height = moveLen + "px";
        _this.$refs.rowHeight[idx].style.lineHeight = moveLen + "px";
        _this.tabulation[idx].arr.forEach(item => {
          item.style.height = moveLen + "px";
        });
        _this.$nextTick(() => {
          _this.$refs.tableTr.forEach((item, idx) => {
            // item.offsetHeight
            if (moveLen < item.offsetHeight - 20) {
              _this.tabulation[idx].arr.forEach(e => {
                e.style.height = item.offsetHeight + "px";
              });
              _this.$refs.rowHeight[idx].style.height = item.offsetHeight + "px";
              _this.$refs.rowHeight[idx].style.lineHeight = item.offsetHeight + "px";
            }
          });
        });
      };
      // 鼠标松开事件
      document.onmouseup = function(event) {
        _this.coordinates();
        _this.widthFunction();
        document.onmousemove = null;
        document.onmouseup = null;
        event.stopPropagation();
      };
    },
    heightRightClick(idx, e, sta) {
      this.rightEditIdx = idx;
      this.sta = sta;
      if (sta == 1) {
        this.$refs.rightEdit.style.top = e.clientY - this.$refs.tableDesign.getBoundingClientRect().y + "px";
        this.$refs.rightEdit.style.left = "20px";
      } else {
        let letWidth = e.x - this.$refs.tableDesign.getBoundingClientRect().x;
        let boxWidth = this.$refs.colWidthBox.getBoundingClientRect().width - letWidth;

        if (boxWidth < 100) {
          letWidth = letWidth - 60;
        }
        this.$refs.rightEdit.style.left = letWidth + "px";
        this.$refs.rightEdit.style.top = "-15px";
      }

      this.rightEditStatus = true;
    },
    // 删除行和列
    deleteRows() {
      // 删除行
      if (this.sta == 1) {
        const arrList = [];
        this.tabulation[this.rightEditIdx].arr.forEach((item, e) => {
          if (item.style.display == "none") {
            arrList.push(item.mergeRow);
          }
        });
        const newArr = [...new Set(arrList)];
        newArr.forEach((item, idx) => {
          if (item != undefined) {
            this.tabulation[item].arr.forEach((itm, i) => {
              if (itm.row > 1) {
                itm.row = itm.row - 1;
                itm.style.height = itm.row * this.$refs.rowHeight[idx].offsetHeight + "px";
              }
            });
          }
        });
        this.tabulation[this.rightEditIdx].arr.forEach((item, i) => {
          if (item.row > 1) {
            this.tabulation[this.rightEditIdx + 1].arr[i].style.display = "table-cell";
            this.tabulation[this.rightEditIdx + 1].arr[i].row = item.row - 1;
            this.tabulation[this.rightEditIdx + 1].arr[i].span = item.span;
            this.tabulation[this.rightEditIdx + 1].arr[i].style.width = item.style.width;
            const hIndex = item.style.height.lastIndexOf("px");
            const h = item.style.height.substring(hIndex, item.style.height);
            this.tabulation[this.rightEditIdx + 1].arr[i].style.height = Number(h) - this.$refs.rowHeight[i].offsetHeight + "px";
          }
        });
        this.tabulation.splice(this.rightEditIdx, 1);
        console.log("删除行啊 ----------------------------");
      } else {
        // 删除列
        console.log("删除列啊-----------------------------");
        this.tabulation.forEach((items, index) => {
          items.arr.forEach((item, idx) => {
            if (this.rightEditIdx == item.mergeSpan) {
              item.style.display = "table-cell";
            }

            if (idx == this.rightEditIdx) {
              if (item.style.display == "none") {
                if (item.mergeSpan != undefined && item.mergeSpan != idx) {
                  const wIndex = item.style.width.lastIndexOf("px");
                  const w = item.style.width.substring(wIndex, item.style.width);
                  const wdx = this.tabulation[index].arr[item.mergeSpan].style.width.lastIndexOf("px");
                  const wd = this.tabulation[index].arr[item.mergeSpan].style.width.substring(wdx, this.tabulation[index].arr[item.mergeSpan].style.width);
                  // this.tabulation[index].arr[item.mergeSpan].style.width = Number(wd) - Number(w) + "px"; //勿动这条 暂时注释 后续可能会用到
                  this.tabulation[index].arr[item.mergeSpan].span = this.tabulation[index].arr[item.mergeSpan].span - 1;
                  this.tabulation[index].arr[item.mergeSpan].span = this.tabulation[index].arr[item.mergeSpan].span = 0 ? 1 : this.tabulation[index].arr[item.mergeSpan].span;
                }
              }
            }
          });
        });
        this.tabulation.forEach((item, index) => {
          item.arr.forEach((i, idx) => {
            if (idx == this.rightEditIdx) {
              this.tabulation[index].arr.splice(idx, 1);
            }
          });
        });
        // this.$refs.colWidth.splice(this.rightEditIdx, 1);

        this.highWide();
        console.log("---------------------------------");
        console.log(this.tabulation);
        console.log("---------------------------------");
        // this.coordinates();
      }
      this.tabulation.forEach((item, index) => {
        item.arr.forEach((i, idx) => {
          if (i.attributeTypes == 1 && i.name.length != 0 && i.checkout == false) {
            i.status = false;
          }
          if (i.span == 1) {
            this.$refs.colWidth[idx].style.width = i.style.width;
          }
        });
      });

      this.refreshStatus = false;
      this.$nextTick(() => {
        this.refreshStatus = true;
        this.coordinates();
        this.highWide();
      });
    },
    // 插入行和列
    insertRows() {
      // 插入行

      if (this.sta == 1) {
        // return console.log(this.rightEditIdx)
        const arrList = [];
        this.tabulation[this.rightEditIdx].arr.forEach((item, e) => {
          if (item.style.display == "none") {
            arrList.push(item.mergeRow);
          }
        });
        const newArr = [...new Set(arrList)];
        newArr.forEach(item => {
          if (item != undefined) {
            this.tabulation[item].arr.forEach((itm, i) => {
              if (itm.row > 1) {
                itm.row = itm.row + 1;
                const hIndex = itm.style.height.lastIndexOf("px");
                const h = itm.style.height.substring(hIndex, itm.style.height);
                itm.style.height = Number(h) + 30 + "px";
              }
            });
          }
        });
        const lineArr = [];
        this.$refs.colWidth.forEach((item, i) => {
          lineArr.push({
            name: "",
            a: "",
            h: 22,
            x: i * 40,
            y: this.tabulation * 22,
            w: 40,
            span: 1,
            row: 1,
            begin_x: 0,
            end_x: 0,
            begin_y: 0,
            end_y: 0,
            status: true,
            disabled: true,
            checkType: "",
            checkout: false,
            attributeTypes: "1",
            option: [{ label: "" }],
            displayStatus: true,
            signatureDate: {
              // 签名区
              content: "", // 内容
              width: "", // 宽度
              height: "", // 高度
              signatureUnit: "", // 签名单位
              signer: "", // 签名人
              name: "", // 签名
              img: "",
              id: ""
            },
            style: {
              position: "relative",
              backgroundClip: "padding-box",
              width: this.$refs.colWidth[i].offsetWidth + "px",
              height: "22px",
              fontWeight: 400,
              position: "relative",
              fontStyle: "normal",
              textAlign: "left",
              display: "table-cell",
              verticalAlign: "middle",
              background: "none",
              fontFamily: "SimSun",
              fontSize: "12px",
              color: "#000",
              textDecoration: "none"
            }
          });
        });

        this.tabulation[this.rightEditIdx].arr.forEach((item, e) => {
          if (this.rightEditIdx == 0) {
            return;
          } else {
          }
        });
        this.tabulation.splice(this.rightEditIdx, 0, { arr: lineArr, status: true });
        console.log(lineArr);
        this.tabulation.forEach((item, index) => {
          item.arr.forEach((i, idx) => {
            i.style.background = "none";
            if (index == this.rightEditIdx) {
              i.style.background = "#e4e7ed";
            }
          });
        });
      } else {
        // 插入列
        this.tabulation.forEach((items, index) => {
          const data = {
            name: "",
            a: "",
            h: 22,
            x: 40,
            y: 22,
            w: 40,
            span: 1,
            row: 1,
            begin_x: 0,
            end_x: 0,
            begin_y: 0,
            end_y: 0,
            status: true,
            disabled: true,
            checkType: "",
            checkout: false,
            attributeTypes: "1",
            option: [{ label: "" }],
            displayStatus: true,
            signatureDate: {
              // 签名区
              content: "", // 内容
              width: "", // 宽度
              height: "", // 高度
              signatureUnit: "", // 签名单位
              signer: "", // 签名人
              name: "", // 签名
              img: "",
              id: ""
            },
            style: {
              position: "relative",
              backgroundClip: "padding-box",
              width: "40px",
              height: "22px",
              fontWeight: 400,
              position: "relative",
              fontStyle: "normal",
              textAlign: "left",
              display: "table-cell",
              verticalAlign: "middle",
              background: "none",
              fontFamily: "SimSun",
              fontSize: "12px",
              textDecoration: "none"
            }
          };
          const ind = this.tabulation[index].arr[this.rightEditIdx];
          if (ind.style.display == "none") {
            if (ind.mergeSpan != undefined && ind.mergeSpan != this.rightEditIdx) {
              data.mergeSpan = ind.mergeSpan;
              data.mergeRow = ind.mergeRow;
              if (ind.mergeRow == undefined || ind.mergeRow == index) {
                const wIndex = this.tabulation[index].arr[ind.mergeSpan].style.width.lastIndexOf("px");
                const w = this.tabulation[index].arr[ind.mergeSpan].style.width.substring(wIndex, this.tabulation[index].arr[ind.mergeSpan].style.width);
                this.tabulation[index].arr[ind.mergeSpan].style.width = Number(w) + 40 + "px";
                this.tabulation[index].arr[ind.mergeSpan].span = this.tabulation[index].arr[ind.mergeSpan].span + 1;
              }
              data.style.display = "none";
            }
          }
          this.tabulation[index].arr.splice(this.rightEditIdx, 0, data);
        });
        this.tabulation.forEach(item => {
          item.arr.forEach((i, idx) => {
            i.style.background = "none";
            if (idx == this.rightEditIdx) {
              i.style.background = "#e4e7ed";
            }
          });
        });
      }
      this.refreshStatus = false;
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          if (i.attributeTypes == 1 && i.name.length != 0 && i.checkout == false) {
            i.status = false;
          }
        });
      });

      this.$nextTick(() => {
        this.refreshStatus = true;
        this.coordinates();
        this.highWide();
      });
    },
    highWide() {
      this.tabulation[this.tabulation.length - 1].arr.forEach((item, idx) => {
        this.$refs.colWidth[idx].style.width = item.style.width;
      });
      this.$refs.rowHeight.forEach((item, idx) => {
        item.style.height = this.tabulation[idx].arr[this.tabulation[idx].arr.length - 1].style.height;
        item.style.lineHeight = this.tabulation[idx].arr[this.tabulation[idx].arr.length - 1].style.height;
      });
    },
    // 设置表格列宽
    widthClick(idx, event) {
      const w = this.$refs.colWidth[idx].offsetWidth; // 获取 div 元素的宽度，包含内边距（padding）和边框（border）
      const startX = event.clientX; // 鼠标指针的水平坐标
      event.preventDefault(); // 取消浏览器对当前事件的默认行为。
      event.stopPropagation(); // 阻止事件在DOM中继续传播，防止再触发定义在别的节点上的监听函数。
      // 鼠标拖动事件
      const _this = this;
      document.onmousemove = function(event) {
        const change = event.clientX - startX; // 鼠标移动的偏移值
        const moveLen = w + change; // 鼠标移动后，分割线节点元素的左边界的偏移值
        if (moveLen <= 22) {
          return;
        }
        _this.$refs.colWidth[idx].style.width = moveLen + "px";
        _this.tabulation.forEach(item => {
          item.arr[idx].style.width = moveLen + "px";
        });
        _this.$refs.tableTr.forEach((item, idx) => {
          _this.tabulation[idx].arr.forEach(e => {
            e.style.height = item.offsetHeight + "px";
          });
          _this.$refs.rowHeight[idx].style.height = item.offsetHeight + "px";
          _this.$refs.rowHeight[idx].style.lineHeight = item.offsetHeight + "px";
        });
      };
      this.widthFunction();
      _this.coordinates();
      // 鼠标松开事件
      document.onmouseup = function(event) {
        _this.widthFunction();

        _this.coordinates();
        document.onmousemove = null;
        document.onmouseup = null;
        event.stopPropagation();
      };
    },
    widthFunction() {
      const left = this.shortDmOrientation == 1 ? 787 : 1013;
      let num = 0;
      let status = true;
      let wd = 0;
      this.$refs.colWidth.forEach((item, i) => {
        num = num + this.$refs.colWidth[i].offsetWidth;
        if (num > left && status) {
          status = false;
          const wid = this.$refs.tableDesign.offsetWidth - (num - this.$refs.colWidth[i].offsetWidth);
          if (this.shortDmOrientation == 1) {
            this.$refs.endlongLeft.style.left = num - this.$refs.colWidth[i].offsetWidth + "px";
            this.$refs.endlongLeft.style.width = wid + "px";
            this.$refs.endlongLeft.style.height = this.$refs.tableDesign.offsetHeight + "px";
          } else {
            this.$refs.abscissaLeft.style.left = num - this.$refs.colWidth[i].offsetWidth + "px";
            this.$refs.abscissaLeft.style.width = wid + "px";
            this.$refs.abscissaLeft.style.height = this.$refs.tableDesign.offsetHeight + "px";
          }
          wd = num - this.$refs.colWidth[i].offsetWidth;
        }
      });
      const top = this.shortDmOrientation == 1 ? 1013 : 787;
      let h = 0;
      let hStatus = true;
      this.$refs.rowHeight.forEach((item, i) => {
        h = h + this.$refs.rowHeight[i].offsetHeight;
        if (h > top && hStatus) {
          hStatus = false;
          const hd = this.$refs.tableDesign.offsetHeight - (h - this.$refs.rowHeight[i].offsetHeight);
          if (this.shortDmOrientation == 1) {
            this.$refs.endlongTop.style.top = h - this.$refs.rowHeight[i].offsetHeight + "px";
            this.$refs.endlongTop.style.height = hd + "px";
            this.$refs.endlongTop.style.width = wd + "px";
          } else {
            this.$refs.abscissaTop.style.top = h - this.$refs.rowHeight[i].offsetHeight + "px";
            this.$refs.abscissaTop.style.height = hd + "px";
            this.$refs.abscissaTop.style.width = wd + "px";
          }
        }
      });
    },
    // 刷新XY坐标
    coordinates() {
      const h = 0;
      let x = 0;
      // 刷新x坐标
      const _this = this;
      _this.tabulation.forEach((item, index) => {
        item.arr.forEach((i, idx) => {
          if (i.span > 1) {
            let num = _this.$refs.colWidth[idx].offsetWidth;
            let indx = idx;
            for (let e = 1; e < i.span; e++) {
              indx = indx + 1;
              num = num + _this.$refs.colWidth[indx].offsetWidth;
            }
            // let wIndex = i.style.width.lastIndexOf("px");
            // let w = i.style.width.substring(wIndex, i.style.width);

            i.style.width = num + "px";
            // console.log("---------xxxxxxxxx-----------------------------")
            // // console.log(Number(w) + num )
            // // console.log(Number(w))
            // console.log( num )
            // console.log("---------xxxxxxxxx-----------------------------")
          }
          if (i.row > 1) {
            let hIndex = index;
            let hNum = _this.$refs.rowHeight[index].offsetHeight;
            //
            for (let s = 1; s < i.row; s++) {
              hIndex = hIndex + 1;
              hNum = hNum + _this.$refs.rowHeight[hIndex].offsetHeight;
            }
            i.style.height = hNum + "px";
          }
        });
      });
      _this.tabulation.forEach((item, idx) => {
        x = 0;
        let e = 0;
        let span = 1;
        item.arr.forEach((i, id) => {
          if (i.span > 1) {
            span = i.span;
            e = 0;
          }
          if (e == 0) {
            i.begin_x = x;
            const wIndex = i.style.width.lastIndexOf("px");
            const wd = i.style.width.substring(wIndex, i.style.width);
            x = x + Number(wd);
            i.x = x;
            i.end_x = x;
            // i.y = h;
          }
          if (span > 1) {
            e = e + 1;
          }
          if (e == span) {
            e = 0;
            span = 1;
          }
        });
      });
      _this.tabulation.forEach((item, idx) => {
        x = 0;
        let e = 0;
        let span = 1;
        item.arr.forEach((i, id) => {
          if (i.span > 1) {
            span = i.span;
            e = 0;
          }
          if (e == 0) {
            i.begin_x = x;
            const wIndex = i.style.width.lastIndexOf("px");
            const wd = i.style.width.substring(wIndex, i.style.width);
            x = x + Number(wd);
            i.x = x;
            i.end_x = x;
            // i.y = h;
          }
          if (span > 1) {
            e = e + 1;
          }
          if (e == span) {
            e = 0;
            span = 1;
          }
        });
      });
      console.log("删除行重新加载");
      // // 刷新Y坐标
      const rowSum = 0;
      const sequence = null;
      const count = 0;
      const rowStatus = false;
      let sum = 0;
      let beGin = 0;
      this.tabulation.forEach((item, idx) => {
        beGin = sum;
        sum = sum + this.$refs.rowHeight[idx].offsetHeight;
        item.arr.forEach((i, id) => {
          const hIndex = i.style.height.lastIndexOf("px");
          const h = i.style.height.substring(hIndex, i.style.height);
          i.y = Number(h) + beGin;
          i.begin_y = beGin;
          i.end_y = Number(h) + beGin;
        });
      });
      this.$nextTick(() => {
        this.widthFunction();
      });
    },

    wdMouseUp(idx, event) {
      this.coordinates();
      event.stopPropagation();
      document.onmousemove = null;
      document.onmouseup = null;
      this.widthFunction();
    },
    // 还原样式
    setFileDivClass() {
      const files = document.getElementsByName("file");
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        file.style = "";
        file.className = this.selectDivClassName;
      }
    },
    // 复制
    copy() {
      this.copyData = null;
      this.copyData = JSON.stringify(this.tabulation[this.idx].arr[this.id]);
      this.copyData = JSON.parse(this.copyData);
      this.copyStatus = false;
      console.log(this.copyData);
    },
    // 粘贴
    stickup() {
      if (this.copyData != null) {
        this.copyData = JSON.stringify(this.copyData);
        this.copyData = JSON.parse(this.copyData);
        this.tabulation[this.idx].arr[this.id].attributeTypes = this.copyData.attributeTypes;
        this.tabulation[this.idx].arr[this.id].checkType = this.copyData.checkType;
        this.tabulation[this.idx].arr[this.id].checkout = this.copyData.checkout;
        this.tabulation[this.idx].arr[this.id].disabled = this.copyData.disabled;
        this.tabulation[this.idx].arr[this.id].displayStatus = this.copyData.displayStatus;
        this.tabulation[this.idx].arr[this.id].name = this.copyData.name;
        this.tabulation[this.idx].arr[this.id].option = this.copyData.option;
        this.tabulation[this.idx].arr[this.id].signatureDate = this.copyData.signatureDate;
        // this.tabulation[this.idx].arr[this.id].style.height = this.copyData.style.height;
        this.copyStatus = false;

        return console.log(this.copyData);
        // this.coordinates();
        // this.coordinates();
        // return console.log(this.copyData)
        this.refreshStatus = false;
        this.$nextTick(() => {
          this.refreshStatus = true;
          this.coordinates();
          this.highWide();
        });
      }
    },
    // TD右键方法
    tdRightClick(idx, e) {
      console.log(e.clientY - this.$refs.tableDesign.getBoundingClientRect().y + "px");
      this.$refs.tdRightEdit.style.top = e.clientY - this.$refs.tableDesign.getBoundingClientRect().y + "px";
      this.$refs.tdRightEdit.style.left = e.clientX - this.$refs.tableDesign.getBoundingClientRect().x + "px";
      this.copyStatus = true;
    },
    // 鼠标左键按下方法
    onmousedownClick(idx, id, event) {
      this.ranksStatus = false;
      // 执行单个 单元格点击方法
      this.details(idx, id);
      // 拖拉选择方法
      console.log(this.tabulation[idx].arr[id]);
      // event.stopPropagation();
      this.isRightClick = true;
      this.start_x = event.clientX;
      this.start_y = event.clientY;
      const _this = this;
      const divElement = document.getElementById("rectangular");
      if (_this.$refs.tableDesign != undefined) {
        var Xd = _this.$refs.tableDesign.getBoundingClientRect();
      }

      _this.left_x = this.start_x - Xd.x;
      _this.top_y = this.start_y - Xd.y;
      // event.preventDefault();
      event.stopPropagation();
      document.onmousemove = function(event) {
        event.preventDefault();
        const end_x = event.clientX;
        const end_y = event.clientY;
        if (_this.$refs.rectangular != undefined) {
          if (_this.$refs.tableDesign != undefined) {
            var Xd = _this.$refs.tableDesign.getBoundingClientRect();
          }
          divElement.style.display = "block";
          divElement.className = "rectangular";
          divElement.style.top = _this.top_y + "px";
          divElement.style.left = _this.left_x + "px";
          _this.tabulation[idx].arr[id].style.background = "none";
          // 从左往右
          // 画矩形
          if (_this.start_x < end_x) {
            if (_this.shortDmOrientation == 1) {
              if (end_x - Xd.x > _this.$refs.endlongLeft.getBoundingClientRect().x - Xd.x) {
                return;
              }
              if (end_y - Xd.y > _this.$refs.endlongTop.getBoundingClientRect().y - Xd.y) {
                return;
              }
            } else {
              if (end_x - Xd.x > _this.$refs.abscissaLeft.getBoundingClientRect().x - Xd.x) {
                return;
              }
              if (end_y - Xd.y > _this.$refs.abscissaTop.getBoundingClientRect().y - Xd.y) {
                return;
              }
            }
            divElement.style.width = end_x - _this.start_x + "px";
            divElement.style.height = end_y - Xd.y - _this.top_y + "px";

            // 从下往上
            if (_this.start_y > end_y) {
              const tableTop = document.getElementById("leftTable").getBoundingClientRect();
              if (divElement.getBoundingClientRect().bottom < tableTop.top) {
                const box = _this.$refs.leftTable;
                box.scrollTop = box.scrollTop - 20;
              }
            } else {
              const customTable = document.querySelectorAll(".custom-table")[0];
              if (_this.shortDmOrientation == 1) {
                if (end_y - Xd.y > _this.$refs.endlongTop.getBoundingClientRect().y - Xd.y) {
                  return;
                }
              } else {
                if (end_y - Xd.y > _this.$refs.abscissaTop.getBoundingClientRect().y - Xd.y) {
                  return;
                }
              }
              const tableBottom = document.getElementById("leftTable").getBoundingClientRect().bottom - 40;
              if (end_y - Xd.y > customTable.offsetHeight - 22) {
                if (divElement.getBoundingClientRect().bottom > tableBottom) {
                  const box = _this.$refs.tableBoxY;
                  box.scrollTop = box.scrollTop + 10;
                }
              }
            }
          } else {
            divElement.style.width = _this.start_x - end_x + "px";
            divElement.style.left = end_x - Xd.x + "px";
            divElement.style.height = end_y - Xd.y - _this.top_y + "px";
            // //从下往上
            if (_this.start_y > end_y) {
              divElement.style.top = end_y - Xd.y + "px";
              divElement.style.height = _this.top_y + Xd.y - end_y + "px";
              const tableTop = document.getElementById("leftTable").getBoundingClientRect();
              if (divElement.getBoundingClientRect().top < tableTop.top) {
                const box = _this.$refs.leftTable;
                box.scrollTop = box.scrollTop - 8;
              }
            } else {
            }
          }
        }
      };

      document.onmouseup = function(event) {
        // 禁用鼠标移动时间

        document.onmousemove = null;
        document.onmouseup = null;
        event.stopPropagation();
        const dd = _this.$refs.rectangular.getBoundingClientRect();
        var Xd = _this.$refs.tableDesign.getBoundingClientRect();
        let end_x = dd.x - Xd.x + dd.width;
        let end_y = dd.y - Xd.y + dd.height;
        let hd_x = dd.y - Xd.y;
        let wd_x = dd.x - Xd.x;
        _this.end_x = event.clientX;
        _this.end_y = event.clientY;
        // 移动样式清空
        if (_this.$refs.rectangular != undefined) {
          const divElement = document.getElementById("rectangular");

          divElement.style.display = "none";
        }
        document.onmousemove = null;
        document.onmousemove = null;
        if (_this.$refs.tableDesign != undefined) {
          var Xd = _this.$refs.tableDesign.getBoundingClientRect();
        }
        if (hd_x > end_y) {
          const yy = end_y;
          end_y = hd_x;
          hd_x = yy;
        }
        if (wd_x > end_x) {
          const ww = end_x;
          end_x = wd_x;
          wd_x = ww;
        }

        _this.tabulation.forEach((item, idx) => {
          item.arr.forEach(i => {
            for (let hs = i.begin_y; hs < i.end_y; hs++) {
              if (hs > hd_x && hs < end_y) {
                for (let s = i.begin_x; s < i.end_x; s++) {
                  if (s > wd_x && s < end_x) {
                    hd_x = i.begin_y < hd_x ? i.begin_y : hd_x;
                    end_y = i.end_y > end_y ? i.end_y : end_y;
                    end_x = i.end_x > end_x ? i.end_x : end_x;
                    wd_x = i.begin_x < wd_x ? i.begin_x : wd_x;
                  }
                }
              }
            }
          });
        });
        _this.tabulation.forEach((item, idx) => {
          item.arr.forEach(i => {
            for (let hs = i.begin_y; hs < i.end_y; hs++) {
              if (hs > hd_x && hs < end_y) {
                for (let s = i.begin_x; s < i.end_x; s++) {
                  if (s > wd_x && s < end_x) {
                    hd_x = i.begin_y < hd_x ? i.begin_y : hd_x;
                    end_y = i.end_y > end_y ? i.end_y : end_y;
                    end_x = i.end_x > end_x ? i.end_x : end_x;
                    wd_x = i.begin_x < wd_x ? i.begin_x : wd_x;
                  }
                }
              }
            }
          });
        });
        _this.tabulation.forEach((item, idx) => {
          item.arr.forEach(i => {
            for (let hs = i.begin_y; hs < i.end_y; hs++) {
              if (hs > hd_x && hs < end_y) {
                for (let s = i.begin_x; s < i.end_x; s++) {
                  if (s > wd_x && s < end_x) {
                    hd_x = i.begin_y < hd_x ? i.begin_y : hd_x;
                    end_y = i.end_y > end_y ? i.end_y : end_y;
                    end_x = i.end_x > end_x ? i.end_x : end_x;
                    wd_x = i.begin_x < wd_x ? i.begin_x : wd_x;
                  }
                }
              }
            }
          });
        });
        _this.tabulation.forEach((item, idx) => {
          item.arr.forEach(i => {
            for (let hs = i.begin_y; hs <= i.end_y; hs++) {
              if (hs > hd_x && hs < end_y) {
                for (let s = i.begin_x; s < i.end_x; s++) {
                  if (s > wd_x && s < end_x) {
                    i.style.background = "#e4e7ed";
                  }
                }
              }
            }
          });
        });
        _this.tabulation.forEach((item, idx) => {
          item.arr.forEach(i => {
            for (let hs = i.begin_y; hs <= i.end_y; hs++) {
              if (hs > hd_x && hs < end_y) {
                for (let s = i.begin_x; s < i.end_x; s++) {
                  if (s > wd_x && s < end_x) {
                    i.style.background = "#e4e7ed";
                  }
                }
              }
            }
          });
        });
        // 如果点击空白处
        _this.selectIdList = [];
        _this.coordinates();
        _this.setFileDivClass();
      };
    },

    //////////////////开始/////////////////////
    design() {
      this.show3 = true;
      this.attributeTypes = "";
      this.tabulation = [];
      this.$nextTick(() => {
        this.$refs.leftTable.scrollTop = 0;
        this.$refs.leftTable.scrollLeft = 0;
      });
      if ((this.addTitle == "编辑表格信息" && this.form.tableData != null) || this.addTitle == "复制新建" || this.redactStatus == true) {
        this.shortDmOrientation = this.form.tableHead;
        let x = 0;
        let y = 0;
        if (this.shortDmOrientation == 1) {
          x = 787;
          y = 1013;
        } else {
          x = 1013;
          y = 787;
        }
        if (this.form.tableData instanceof Array) {
          this.tabulationArr = this.form.tableData;
        } else {
          this.tabulationArr = JSON.parse(this.form.tableData);
        }

        // console.log( this.tabulationArr )
        // if (typeof this.tabulationArr == "string" && this.tabulationArr.constructor == String) {
        //   this.tabulationArr = JSON.parse(this.tabulationArr);
        // }
        if (this.tabulationArr instanceof Array) {
        } else {
          this.tabulationArr = JSON.parse(this.tabulationArr);
        }
        this.tabulationArr.forEach((item, idx) => {
          this.$nextTick(() => {
            const rowHeight = document.getElementById("rowHeight" + idx);
            rowHeight.style.height = item.arr[item.arr.length - 1].style.height;
            rowHeight.style.lineHeight = item.arr[item.arr.length - 1].style.height;
          });
          item.arr.forEach((i, e) => {
            if (i.span == 1) {
              this.$nextTick(() => {
                const colWidth = document.getElementById("colWidth" + e);
                colWidth.style.width = i.style.width;
              });
            }
            if (i.style.border != "none") {
              if (i.style.borderLeft) {
                i.style.borderLeft = "2px solid #1f2d3d";
              }
              if (i.style.borderRight) {
                i.style.borderRight = "2px solid #1f2d3d";
              }
              if (i.style.borderBottom) {
                i.style.borderBottom = "2px solid #1f2d3d";
              }
              if (i.style.borderTop) {
                i.style.borderTop = "2px solid #1f2d3d";
              }
            } else {
              i.style.border = "1px solid rgba(0,0,0,0.2)";
              i.style.borderLeft = "1px solid rgba(0,0,0,0.2)";
              i.style.borderRight = "1px solid rgba(0,0,0,0.2)";
              i.style.borderBottom = "1px solid rgba(0,0,0,0.2)";
              i.style.borderTop = "1px solid rgba(0,0,0,0.2)";
            }
          });
        });
        this.tabulation = this.tabulationArr;
      } else {
        this.row = "";
        this.span = "";
        // this.tabulation = [];
        // 默认纸张竖向
        this.shortDmOrientation = "1";
        for (let i = 0; i < 60; i++) {
          this.tabulation.push({ arr: [], status: true });
          for (let e = 0; e < 30; e++) {
            this.$nextTick(() => {
              const colWidth = document.getElementById("colWidth" + e);
              colWidth.style.width = "40px";
            });
            this.tabulation[i].arr.push({
              id: "",
              name: "",
              a: "",
              h: 22,
              x: e * 40,
              y: i * 22,
              w: 40,
              span: 1,
              row: 1,
              begin_x: 0,
              end_x: 0,
              begin_y: 0,
              end_y: 0,
              status: false,
              disabled: true,
              checkType: "",
              checkout: false,
              attributeTypes: "1",
              option: [{ label: "" }],
              displayStatus: true,
              signatureDate: {
                // 签名区
                content: "", // 内容
                width: "", // 宽度
                height: "", // 高度
                signatureUnit: "", // 签名单位
                signer: "", // 签名人
                name: "", // 签名
                img: "",
                id: ""
              },
              style: {
                // borderLeft: "none",
                // borderRight: "none",
                // borderTop: "none",
                // borderBottom: "none",
                position: "relative",
                backgroundClip: "padding-box",
                width: "40px",
                height: "22px",
                fontWeight: 400,
                position: "relative",
                fontStyle: "normal",
                textAlign: "left",
                display: "table-cell",
                verticalAlign: "middle",
                background: "none",
                fontFamily: "SimSun",
                fontSize: "12px",
                textDecoration: "none"
              }
            });
          }
        }
      }
      this.fullscreen = true;
      const _this = this;
      _this.$nextTick(() => {
        _this.coordinates();
        _this.handleFullScreen();
      });
    },
    details(idx, id) {
      if (this.$refs.upSelect != undefined) {
        this.$refs.upSelect.blur();
      }
      this.idx = idx;
      this.id = id;
      this.row = idx + 1;
      this.span = id + 1;
      this.splitRow = this.tabulation[idx].arr[id].row;
      this.splitSpan = this.tabulation[idx].arr[id].span;
      this.name = "";
      this.attributeTypes = this.tabulation[idx].arr[id].attributeTypes;
      this.checked = this.tabulation[idx].arr[id].disabled;
      this.checkout = this.tabulation[idx].arr[id].checkout;
      this.checkType = this.tabulation[idx].arr[id].checkType;
      this.optionContent = this.tabulation[idx].arr[id].option;
      this.typeface = this.tabulation[idx].arr[id].style.fontFamily;
      this.fontWeight = this.tabulation[idx].arr[id].style.fontWeight;
      this.fontStyle = this.tabulation[idx].arr[id].style.fontStyle;
      this.textDecoration = this.tabulation[idx].arr[id].style.textDecoration;
      this.textAlign = this.tabulation[idx].arr[id].style.textAlign;
      this.verticalAlign = this.tabulation[idx].arr[id].style.verticalAlign;
      this.signatureDate = this.tabulation[idx].arr[id].signatureDate;
      this.signatureUnitList.forEach(item => {
        if (this.signatureDate.signatureUnit == item.pkId) {
          if (item.sysDefaultRoleList == null) {
            this.signerList = [];
          } else {
            this.signerList = item.sysDefaultRoleList;
          }
        }
      });
      if (this.tabulation[idx].arr[id].style.fontSize != undefined) {
        const index = this.tabulation[idx].arr[id].style.fontSize.lastIndexOf("px");
        const size = this.tabulation[idx].arr[id].style.fontSize.substring(index, this.tabulation[idx].arr[id].style.fontSize);
        this.fontSize = size;
      } else {
        this.fontSize = "";
      }
      this.tabulation.forEach(item => {
        item.arr.forEach(i => {
          i.style.background = "none";
        });
      });
      this.tabulation[idx].arr[id].style.background = "#e4e7ed";
    },
    generate() {
      this.redactStatus = true;
      this.clearBackground();
      this.coordinates();
      if (this.tabulation.length == 0) {
        return this.$message.warning("表格不能为空");
      }
      this.contentData = this.tabulation;
      this.form.tableHead = this.shortDmOrientation;
      let x = 0;
      let y = 0;
      if (this.shortDmOrientation == 1) {
        x = 787;
        y = 1013;
      } else {
        x = 1013;
        y = 787;
      }
      const arr = JSON.stringify(this.tabulation);
      this.tabulationArr = JSON.parse(arr);
      this.tabulationArr.forEach(item => {
        item.arr.forEach((i, s) => {
          i.status = false;
          i.style.background = "none";
          if (i.style.borderLeft == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
          }
          if (i.style.borderRight == "2px solid #1f2d3d") {
            i.style.borderRight = "1px solid #1f2d3d";
          }
          if (i.style.borderTop == "2px solid #1f2d3d") {
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.borderBottom == "2px solid #1f2d3d") {
            i.style.borderBottom = "1px solid #1f2d3d";
          }
          if (i.style.border == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
            i.style.borderRight = "1px solid #1f2d3d";
            i.style.borderBottom = "1px solid #1f2d3d";
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.border == "1px solid rgba(0,0,0,0.2)") {
            i.style.border = "none";
            i.style.borderLeft = "none";
            i.style.borderRight = "none";
            i.style.borderTop = "none";
            i.style.borderBottom = "none";
            i.style.border = "none";
          }
        });
      });
      this.form.tableData = JSON.stringify(this.tabulationArr);
      if (this.addTitle != "新建表格" && this.addTitle != "复制新建") {
        const pkId = this.formDate.pkId;
        this.formDate = {
          tableData: this.form.tableData,
          pkId
        };
      } else {
        this.formDate = {
          tableData: this.form.tableData
        };
      }

      const arrAy = JSON.stringify(this.tabulationArr);
      const arrAYs = JSON.parse(arrAy);
      arrAYs.forEach((item, idx) => {
        item.arr.forEach((i, index) => {
          if (i.x > x || i.y > y) {
            i.style.display = "none";
          }
        });
      });

      //---------删除无效数据开始--------------------
      arrAYs.forEach((item, idx) => {
        item.arr.forEach((i, index) => {
          if (i.x > x || i.y > y) {
            item.arr.splice(index--, 1);
          }
        });
        if (arrAYs[idx].arr[0].end_y > y) {
          arrAYs.splice(idx--, 1);
        }
      });
      console.log("删除了数据");
      console.log(arrAYs);
      console.log("删除了数据");
      //---------删除无效数据结束--------------------
      this.form.tableHtml = JSON.stringify(arrAYs);
      this.$nextTick(() => {
        this.show3 = false;
      });
      this.tabulationArr.forEach(item => {
        item.arr.forEach((i, s) => {
          if (i.x > x || i.y > y) {
            i.style.display = "none";
          }
          i.style.background = "none";
          if (i.style.borderLeft == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
          }
          if (i.style.borderRight == "2px solid #1f2d3d") {
            i.style.borderRight = "1px solid #1f2d3d";
          }
          if (i.style.borderTop == "2px solid #1f2d3d") {
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.borderBottom == "2px solid #1f2d3d") {
            i.style.borderBottom = "1px solid #1f2d3d";
          }
          if (i.style.border == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
            i.style.borderRight = "1px solid #1f2d3d";
            i.style.borderBottom = "1px solid #1f2d3d";
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.border == "1px solid rgba(0,0,0,0.2)") {
            i.style.border = "none";
          }
          if (i.style.borderLeft == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderLeft = "none";
          }
          if (i.style.borderRight == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderRight = "none";
          }
          if (i.style.borderTop == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderTop = "none";
          }
          if (i.style.borderBottom == "1px solid rgba(0,0,0,0.2)") {
            i.style.borderBottom = "none";
          }
        });
      });
      const _this = this;
      this.$nextTick(() => {
        _this.srcList = [];
        html2canvas(_this.$refs.previewTableImg, {
          allowTaint: false, // 是否允许跨域图像污染画布
          useCORS: true // 使用CO RS从服务器加载图像，必须为true否则img图片可能显示不出来
          // x: 裁剪画布x坐标,
          // y: 裁剪画布y坐标,
        }).then(canvas => {
          // 点击保存操作
          const url = canvas.toDataURL("image/png");
          console.log("********************");
          console.log(url);
          _this.imageUrl = url;
          _this.srcList.push(url);
          console.log("********************");
        });
      });
    },
    /// //////////////结束/////////////////////
    fkEnginerringChange(val) {
      this.form.fkProfessionalTypeId = "";
      this.projectType.forEach(item => {
        if (item.pkId == val) {
          item.typeSonList.forEach(i => {
            i.label = i.engTypeName;
            i.value = i.pkId;
          });
          this.professionalType = item.typeSonList;
        }
      });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
            const data = { ...this.form };
            data.pkId = this.form.pkId;
            data.tableHtml = utils.zip(data.tableHtml);
            data.tableData = utils.zip(data.tableData);
            // data.fkProfessionalTypeId = this.form.fkProfessionalTypeId;
            // data.fkEnginerringTypeId = this.user.fkEnginerringTypeId;
            this.$api.updateprocessTable(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.show1 = false;
                this.int();
                this.$message({
                  type: "success",
                  message: "编辑成功"
                });
                this.redactStatus = false;
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
        } else {
          return false;
        }
      });
    },
    // 查看
    examine(row) {
      this.$api.findprocessTableById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          let rows = JSON.stringify(res.data);
          rows = JSON.parse(rows);
          this.shortDmOrientation = rows.tableHead;
          // console.log(row.tableHtml);
          // return
          this.tabulation = utils.unzip(rows.tableHtml);

          // console.log(this.tabulation);
          // return
          let x = 0;
          let y = 0;
          if (this.shortDmOrientation == 1) {
            x = 787;
            y = 1013;
            this.pvwWidth = "787";
          } else {
            x = 1013;
            y = 787;
            this.pvwWidth = "1013";
          }
          // const arr = JSON.stringify(this.tabulation);
          // if (typeof this.tabulation == "string" && this.tabulation.constructor == String) {
          //   this.tabulation = JSON.parse(this.tabulation);
          // }
          this.tabulationArr = this.tabulation;
          if (this.tabulationArr instanceof Array) {
          } else {
            this.tabulationArr = JSON.parse(this.tabulationArr);
          }
          // console.log(this.tabulation)
          // return console.log(this.tabulationArr)

          // this.tabulationArr = Array.from(this.tabulationArr);
          this.tabulationArr.forEach(item => {
            item.arr.forEach(i => {
              if (i.x > x || i.y > y) {
                i.style.display = "none";
              }
              i.style.background = "none";
              if (i.style.borderLeft == "2px solid #1f2d3d") {
                i.style.borderLeft = "1px solid #1f2d3d";
              }
              if (i.style.borderRight == "2px solid #1f2d3d") {
                i.style.borderRight = "1px solid #1f2d3d";
              }
              if (i.style.borderTop == "2px solid #1f2d3d") {
                i.style.borderTop = "1px solid #1f2d3d";
              }
              if (i.style.borderBottom == "2px solid #1f2d3d") {
                i.style.borderBottom = "1px solid #1f2d3d";
              }
              if (i.style.border == "2px solid #1f2d3d") {
                i.style.borderLeft = "1px solid #1f2d3d";
                i.style.borderRight = "1px solid #1f2d3d";
                i.style.borderBottom = "1px solid #1f2d3d";
                i.style.borderTop = "1px solid #1f2d3d";
              }
            });
          });
          this.show2 = true;
          this.formDate = rows;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    edit(row) {
      this.$api.findprocessTableById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.show1 = true;
          this.loading = true;
          let arr = JSON.stringify(res.data);
          let rows = JSON.parse(arr);
        //   this.projectType.forEach(item => {
        //     if (item.pkId == res.data.fkEnginerringTypeId) {
        //       item.typeSonList.forEach(i => {
        //         i.label = i.engTypeName;
        //         i.value = i.pkId;
        //       });
        //       this.professionalType = item.typeSonList;
        //     }
        //   });

          this.showType = 2;
          this.addTitle = "编辑表格信息";
          this.form.pkId = rows.pkId;
          this.form.tableName = rows.tableName;
          this.form.sortval = rows.sortval;
          this.form.remark = rows.remark;
          this.form.professionalTypeName = rows.professionalTypeName;
          this.form.tableHtml = JSON.stringify(utils.unzip(rows.tableHtml));
          this.form.tableHead = rows.tableHead;
          this.form.tableData = JSON.stringify(utils.unzip(rows.tableData));
          this.form.tableType = rows.tableType + "";
          this.formDate = rows;
          this.formDate.tableHtml = JSON.stringify(utils.unzip(rows.tableHtml));
          this.formDate.tableData = JSON.stringify(utils.unzip(rows.tableData));
          // ====================================
          this.tabulation = JSON.parse(this.formDate.tableHtml);
          let x = 0;
          let y = 0;
          if (this.form.tableHead == 1) {
            x = 787;
            y = 1013;
            this.pvwWidth = "787";
          } else {
            x = 1013;
            y = 787;
            this.pvwWidth = "1013";
          }
          this.tabulationArr = this.tabulation;
          if (this.tabulationArr instanceof Array) {
          } else {
            this.tabulationArr = JSON.parse(this.tabulationArr);
          }
          this.tabulationArr.forEach(item => {
            item.arr.forEach(i => {
              if (i.x > x || i.y > y) {
                i.style.display = "none";
              }
              i.style.background = "none";
              if (i.style.borderLeft == "2px solid #1f2d3d") {
                i.style.borderLeft = "1px solid #1f2d3d";
              }
              if (i.style.borderRight == "2px solid #1f2d3d") {
                i.style.borderRight = "1px solid #1f2d3d";
              }
              if (i.style.borderTop == "2px solid #1f2d3d") {
                i.style.borderTop = "1px solid #1f2d3d";
              }
              if (i.style.borderBottom == "2px solid #1f2d3d") {
                i.style.borderBottom = "1px solid #1f2d3d";
              }
              if (i.style.border == "2px solid #1f2d3d") {
                i.style.borderLeft = "1px solid #1f2d3d";
                i.style.borderRight = "1px solid #1f2d3d";
                i.style.borderBottom = "1px solid #1f2d3d";
                i.style.borderTop = "1px solid #1f2d3d";
              }
            });
          });
          // ====================================
          const _this = this;
          this.$nextTick(() => {
            _this.srcList = [];
            html2canvas(_this.$refs.previewTableImg, {
              allowTaint: false, // 是否允许跨域图像污染画布
              useCORS: true // 使用CO RS从服务器加载图像，必须为true否则img图片可能显示不出来
              // x: 裁剪画布x坐标,
              // y: 裁剪画布y坐标,
            })
              .then(canvas => {
                // 点击保存操作
                const url = canvas.toDataURL("image/png");
                console.log(url);
                _this.imageUrl = url;
                _this.srcList.push(url);
                _this.loading = false;
              })
              .catch(err => {
                _this.loading = false;
              });
          });
        } else {
          this.$message.warning(res.msg);
        }
      });

      // this.show1 = true;
    },
    preview() {
      if (this.form.tableHtml == null || this.form.tableHtml.length == 0) {
        return this.$message({
          type: "warning",
          message: "请输入表格内容"
        });
      }
      let tabulaArr = this.form.tableHtml;
      let x = 0;
      let y = 0;
      this.shortDmOrientation = this.form.tableHead;
      if (this.shortDmOrientation == 1) {
        x = 787;
        y = 1013;
        this.pvwWidth = "787";
      } else {
        x = 1013;
        y = 787;
        this.pvwWidth = "1013";
      }
      this.tabulationArr = tabulaArr;
      if (this.tabulationArr instanceof Array) {
      } else {
        console.log(this.form.tableHtml);
        console.log("1111");
        this.tabulationArr = JSON.parse(this.tabulationArr);
        if (this.tabulationArr instanceof Array) {
        } else {
          this.tabulationArr = JSON.parse(this.tabulationArr);
        }
      }
      //  return console.log(this.tabulationArr)
      this.tabulationArr.forEach(item => {
        item.arr.forEach(i => {
          if (i.x > x || i.y > y) {
            i.style.display = "none";
          }
          i.style.background = "none";
          if (i.style.borderLeft == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
          }
          if (i.style.borderRight == "2px solid #1f2d3d") {
            i.style.borderRight = "1px solid #1f2d3d";
          }
          if (i.style.borderTop == "2px solid #1f2d3d") {
            i.style.borderTop = "1px solid #1f2d3d";
          }
          if (i.style.borderBottom == "2px solid #1f2d3d") {
            i.style.borderBottom = "1px solid #1f2d3d";
          }
          if (i.style.border == "2px solid #1f2d3d") {
            i.style.borderLeft = "1px solid #1f2d3d";
            i.style.borderRight = "1px solid #1f2d3d";
            i.style.borderBottom = "1px solid #1f2d3d";
            i.style.borderTop = "1px solid #1f2d3d";
          }
        });
      });
      this.show2 = true;
    }
  },
  watch: {
    ranksEdit(val){
      if(!val){
        this.noSaveb={
        left:0,
        right:0,
        bottom:0,
        top:0,
      }
      }
    },
    tablesDialog(val) {
      if (val) {
        this.int()
        this.searchSysAuditRole();
      } else {
        this.cleanSearchData();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-search {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  .dialog-search-item {
    display: flex;
    align-items: center;
    margin-right: 6px;
    .dialog-search-item-label {
    }
    .dialog-search-item-content {
    }
  }
}
.tables {
  height: 500px;
}
/deep/ .iconfont {
  font-size: 12px !important;
}

// /deep/ .el-dialog__header {
//   background-color: #ccc !important;
// }

.table_tanchuan {
  width: 500px;
  margin: 100px auto;
  border-collapse: collapse;
  text-align: center;
}

td,
th {
  border: 1px solid #333;
}

thead tr {
  height: 40px;
  background-color: #fff;
}

thead tr th {
  height: 40px;
  background-color: #ccc;
}

.custom-table-edit {
  /deep/ .el-dialog__body {
    padding: 0 !important;
  }

  .operate {
    display: flex;
    margin: 8px;
  }

  .baseRowColWidth {
    position: absolute;
    height: 100%;
    right: -1px;
    top: 0;
    width: 2px;
  }

  .baseRowColWidth:hover {
    cursor: w-resize;
    background: #409eff;
    color: #fff;
  }

  .custom-table {
    display: flex;
    // justify-content: space-between;
    border: 1px solid;

    height: 500px;

    .left {
      display: flex;
      width: 100%;
      text-align: center;
      //overflow: scroll;
      // overflow: hidden;
      overflow-x: auto;

      .rowHeightBox {
        display: inline-block;
        position: relative;
        z-index: 999;
      }

      .rowHeight {
      }

      .baseRowHeight {
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: -1px;
        z-index: 999999;
        left: 0;
      }

      .baseRowHeight:hover {
        cursor: s-resize;
        background: #409eff !important;
        color: #fff;
      }

      .table {
        border-collapse: collapse;
        text-align: center;

        .table-tr {
          .table-td {
            // border: 1px solid;
            border: none;
          }

          .table-td:hover {
            cursor: default;
          }
        }
      }
    }

    .right {
      position: relative;
      width: 300px;
      border-left: 1px solid;

      .right-row-span {
        margin-top: 10px;
        margin-left: 6px;

        .right-input {
          width: 80px;
        }
      }

      ::-webkit-scrollbar {
        width: 2px;
        color: #ccc;
        background-color: #fcfcfc;
      }

      ::-webkit-scrollbar-thumb {
        background-color: rgb(209, 209, 209);
      }
    }
  }

  .custom-btn {
    padding: 10px;
    text-align: center;
  }

  .rectangular {
    background-color: rgba(235, 239, 243, 0.45);
    //position: fixed;
    position: absolute;
    border: 1px solid rgba(24, 135, 243, 1);
    z-index: 20;
  }

  .pitch-on {
    background: #409eff !important;
    color: #fff !important;
  }
}

.form-td-input {
  /deep/ .el-input__inner {
    background: #e4e7ed !important;
  }
}

.short-dmOrientation:hover {
  cursor: pointer;
}

.bode-color {
  border: 1px solid #fff;
}

.pre-wrap {
  white-space: pre-line;
  // white-space:pre-wrap;
}

.table-box {
  overflow-y: auto;
  height: 100%;
}

::-webkit-scrollbar {
  width: 1px;
  color: #ccc;
  background-color: #fcfcfc;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}

.ranks {
  background: #facd91;
  border-color: #00ffff;
}

.form-data {
  display: flex;
  align-items: center;

  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.seek {
  margin-left: 10px;
}
.btn-right {
  position: absolute;
  right: 40px;
}
/deep/ .el-table__empty-block {
  background-color: #fff;
}
</style>
