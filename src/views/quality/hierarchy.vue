<template>
  <div class="app-container">
    <!-- 顶部搜索 -->
    <div class="search-bgc search-mr" v-if="user.orgType != 5">
      <el-form ref="form" :model="searchData" class="form-data">
        <!-- <el-form-item label="项目" label-width="40px" v-if="[2, 3, 9].includes(user.orgType)">
          <el-select v-model="searchData.projectId" size="mini" @change="projectIdChange(0)">
            <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="标段项目" label-width="100px">
          <!-- <el-select v-model="searchData.noProject" size="mini" @change="querySystem">
            <el-option v-for="item in noProjectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
      </el-form>
    </div>

    <div class="the-container" v-loading="loading" v-if="typeShow">
      <el-tabs v-model="usable" @tab-click="handleClick">
        <el-tab-pane v-for="(tab, index) in tabs" :key="index" :name="tab.name" :label="tab.label">
          <!-- 管理结构 -->
          <div v-show="usable === '1'" class="structure">
            <!-- 上传之前 只有项目部能上传-->
            <div class="uploading" v-if="user.orgType == 5 && !strucStatus">
              <el-upload class="upload-demo" drag :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" accept="image/jpg,image/jpeg,image/png" :action="action">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png/jpeg文件，且不超过5M</div>
              </el-upload>
            </div>
            <!-- 上传之后 -->
            <div class="structure-img" v-else>
              <div class="img-status" v-if="strucStatus">
                <img :src="structureImgarr[0].enclosureUrl" class="img-regulate" />
                <!-- 只有项目部能删除 -->
                <span class="close-img" @click="deleteSystemData(pkID1)" v-if="user.orgType == 5"><i class="el-icon-close"></i></span>
              </div>
              <!-- 无数据展示 -->
              <div slot="empty" class="empty" style="width: 100%" v-else>
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </div>
          </div>
          <!-- 人员配置 -->
          <div v-show="usable === '2'" class="configuration">
            <div class="uploading" v-if="user.orgType == 5 && !strucStatus2">
              <el-upload class="upload-demo" drag :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" accept="image/jpg,image/jpeg,image/png" :action="action">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传pg/png/jpeg文件，且不超过5M</div>
              </el-upload>
            </div>
            <div class="structure-img" v-else>
              <div class="img-status" v-if="strucStatus2">
                <img :src="configurationImg[0].enclosureUrl" class="img-regulate" />
                <span class="close-img" @click="deleteSystemData(pkID2)" v-if="user.orgType == 5"><i class="el-icon-close"></i></span>
              </div>
              <div slot="empty" class="empty" style="width: 100%" v-else>
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </div>
          </div>
          <!-- 管理措施 -->
          <div v-show="usable === '3'" class="measure">
            <div class="system" v-if="fileList.length !== 1">
              <div class="file-item" v-for="(item, index) in fileList" :key="index">
                <div @click="preview(item)">
                  <div><i class="iconfont iconwenjian" title="预览"></i></div>
                  <span :title="item.enclosureName">{{ item.enclosureName }}</span>
                </div>
                <i class="el-icon-close" @click.stop="deleteSystemData(pkID3, index)" v-if="user.orgType == 5"></i>
              </div>
              <div class="btn-upload2" title="上传" @click="uploading" v-if="user.orgType == 5">+</div>
            </div>
            <!-- 如果只有一个文件默认展示预览文件 -->
            <div class="preview-file" v-else>
              <!-- 文档 -->
              <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + fileList[0].enclosureUrl" v-if="jiequ(fileList[0].enclosureUrl) == 'docx' || jiequ(fileList[0].enclosureUrl) == 'xlsx'"></iframe>
              <!-- 图片 -->
              <img :src="fileList[0].enclosureUrl" v-if="jiequ(fileList[0].enclosureUrl) == 'png' || jiequ(fileList[0].enclosureUrl) == 'jpg' || jiequ(fileList[0].enclosureUrl) == 'jpeg'" />
              <!-- pdf -->
              <!-- <div class="pdf" v-if="jiequ(fileList[0].enclosureUrl) == 'pdf'">
                <pdf v-for="i in numPages" :key="i" :page="i" :src="fileList[0].enclosureUrl"></pdf>
              </div> -->
              <iframe :src="fileList[0].enclosureUrl" frameborder="0" class="iframe" v-if="jiequ(fileList[0].enclosureUrl) == 'pdf'" @load="(e)=>{e.preventDefault()}"></iframe>
              <!-- <object type="application/pdf" ref="object" class="iframe" :data="fileList[0].enclosureUrl + '#toolbar=0'" v-if="jiequ(fileList[0].enclosureUrl) == 'pdf'"> </object> -->
              <!-- 只有一个文件时的上传按钮 -->
              <div class="btn-upload btn-upload2" title="删除" @click="deleteSystemData(pkID3, 0)" v-if="user.orgType == 5">-</div>
              <div class="btn-upload" title="上传" @click="uploading" v-if="user.orgType == 5">+</div>
            </div>
            <div slot="empty" class="empty" style="width: 100%" v-if="user.orgType !== 5 && fileList.length == 0">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>

          <!-- 管理制度 -->
          <div v-show="usable === '4'" class="regime">
            <!-- 如果有多个文件 -->
            <div class="system" v-if="fileList2.length !== 1">
              <div class="file-item" v-for="(item, index) in fileList2" :key="index">
                <div @click="preview(item)">
                  <div><i class="iconfont iconwenjian" title="预览"></i></div>
                  <span :title="item.enclosureName">{{ item.enclosureName }}</span>
                </div>
                <!-- 删除文件 -->
                <i class="el-icon-close" @click.stop="deleteSystemData(pkID4, index)" v-if="user.orgType == 5"></i>
              </div>
              <div class="btn-upload2" title="上传" @click="uploading" v-if="user.orgType == 5">+</div>
            </div>
            <!-- 如果只有一个文件默认展示预览文件 -->
            <div class="preview-file" v-else>
              <!-- 文档 -->
              <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + fileList2[0].enclosureUrl" v-if="jiequ(fileList2[0].enclosureUrl) == 'docx' || jiequ(fileList2[0].enclosureUrl) == 'xlsx'"></iframe>
              <!-- 图片 -->
              <img :src="fileList2[0].enclosureUrl" v-if="jiequ(fileList2[0].enclosureUrl) == 'png' || jiequ(fileList2[0].enclosureUrl) == 'jpg' || jiequ(fileList2[0].enclosureUrl) == 'jpeg'" />
              <!-- pdf -->
              <!-- <div class="pdf" v-if="jiequ(fileList2[0].enclosureUrl) == 'pdf'">
                <pdf v-for="i in numPages2" :key="i" :page="i" :src="fileList2[0].enclosureUrl"></pdf>
              </div> -->
              <iframe :src="fileList2[0].enclosureUrl" frameborder="0" class="iframe" v-if="jiequ(fileList2[0].enclosureUrl) == 'pdf'"></iframe>
              <!-- <object type="application/pdf" ref="object" class="iframe" :data="fileList2[3].enclosureUrl + '#toolbar=0'" v-if="this.jiequ(fileList2[0].enclosureUrl) == 'pdf'"> </object> -->
              <!-- 只有一个文件时的上传按钮 -->
              <div class="btn-upload btn-upload2" title="删除" @click="deleteSystemData(pkID4, 0)" v-if="user.orgType == 5">-</div>
              <div class="btn-upload" title="上传" @click="uploading" v-if="user.orgType == 5">+</div>
            </div>
            <div slot="empty" class="empty" style="width: 100%" v-if="user.orgType !== 5 && fileList2.length == 0">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
          <!-- 管理体系图 -->
          <div v-show="usable === '5'" class="system-diagram">
            <!-- 上传之前 -->
            <div class="uploading" v-if="user.orgType == 5 && !strucStatus5">
              <el-upload class="upload-demo" drag :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" accept="image/jpg,image/jpeg,image/png" :action="action">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传pg/png/jpeg文件，且不超过5M</div>
              </el-upload>
            </div>
            <!-- 上传之后 -->
            <div class="structure-img" v-else>
              <div class="img-status" v-if="strucStatus5">
                <img :src="systemImg[0].enclosureUrl" class="img-regulate" />
                <span class="close-img" @click="deleteSystemData(pkID5)"><i class="el-icon-close" v-if="user.orgType == 5"></i></span>
              </div>

              <div slot="empty" class="empty" style="width: 100%" v-else>
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <input v-show="false" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" ref="files" id="upload" @change="upLoad" />
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.enclosureUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.enclosureUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import COS from "cos-js-sdk-v5";
import pdf from "vue-pdf";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
export default {
  data() {
    return {
      // 搜索所需要的数据
      projectList: [],
      noProjectList: [],
      searchData: {
        projectId: "", // 项目
        noProject: "" // 标段项目
      },
      action: "", // 上传地址
      usable: "1", // tab点击切换状态
      tabs: [
        { name: "1", label: "管理结构" },
        { name: "2", label: "人员配置" },
        { name: "3", label: "管理措施" },
        { name: "4", label: "管理制度" },
        { name: "5", label: "管理体系图" }
      ],
      // 1 2 5
      structureImgarr: [{ enclosureUrl: "" }], // 管理制度图片https://epms-1307524156.cos.ap-guangzhou.myqcloud.com/2022072816545362e24edd848e186df1d5c082.png
      configurationImg: [{ enclosureUrl: "" }],
      systemImg: [{ enclosureUrl: "" }],
      // 3
      fileList: [],
      // 4
      fileList2: [],
      number: 1,
      url: "",
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 当前预览的文件路劲
      nowPreviewObj: {},
      nowPreviewObj2: {},
      // 文件类型
      fileType: ["docx", "xlsx", "jpg", "jpeg", "png", "pdf"],
      // tab 3  4 单个展示文件的类型
      singleFiletype: "png",
      numPages: 0,
      numPages2: 0,
      loading: false,
      // 上传过去的文件名字
      fileName: "",
      // 删除用到每个tab对象里面的pkid
      pkID1: "",
      pkID2: "",
      pkID3: "",
      pkID4: "",
      pkID5: "",
      strucStatus: true, // 第一个
      strucStatus2: true, // 二个
      strucStatus5: true, // 第五个
      hierarchyType: 1,
      typeShow:true
    };
  },
  components: {
    pdfPiev,
    pdf
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {},
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    // 上传地址
    this.action = axios.defaults.baseURL + "/eng/file/upload/picture";
    if (this.user.orgType == 5) {
      this.querySystem();
    } 
    // else if (this.user.orgType == 4) {
    //   this.projectIdChange(1);
    // } else {
    //   this.noProject();
    // }
  },
  methods: {
    selectIds(arr,obj,isTrue){
      console.log('获取到的',arr,obj);
      if(arr.length){
        if(arr.length>1){
          this.searchData.projectId = arr[0]
          this.searchData.noProject = arr[1]
        }else{
          this.searchData.noProject = arr[0]
        }
        this.querySystem();
      }
    },
    // 获取项目
    noProject() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          this.projectList = res.data;
          if (this.projectList.length) {
            this.searchData.projectId = this.projectList[0].value;
            this.projectIdChange(0);
          } else {
            this.querySystem();
          }
        }
      });
    },
    // 根据项目id获取标段项目下拉列表
    projectIdChange(num) {
      const data = {
        isWhole: num, // 0代表不查全部
        projectId: this.searchData.projectId
      };
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectList = res.data;
          this.searchData.noProject = this.noProjectList[0].value;
          // 首次进来查询数据
          this.querySystem();
        }
      });
    },
    // 查询体系数据
    querySystem() {
      this.loading = true;
      const data = {
        fkProjectBidId: this.searchData.noProject,
        fkProjectId: this.searchData.projectId,
        hierarchyType: this.hierarchyType // 1质量体系 2 安全体系
      };
      this.$api
        .querySystem(data)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            // 一下pkID1,2,3,4,5是新增时候要传给后端的
            if (res.data.managementOrganization) {
              this.structureImgarr = res.data.managementOrganization.enclosures.length ? res.data.managementOrganization.enclosures : [{ enclosureUrl: "" }]; // 1管理机构图，只有一张
              this.pkID1 = res.data.managementOrganization.pkId;
              this.strucStatus = !!res.data.managementOrganization.enclosures.length;
            } else {
              this.structureImgarr = [{ enclosureUrl: "" }];
              this.strucStatus = false;
            }
            if (res.data.staffing !== null) {
              this.configurationImg = res.data.staffing.enclosures.length ? res.data.staffing.enclosures : [{ enclosureUrl: "" }]; // 2人员配置图，只有一张
              this.pkID2 = res.data.staffing.pkId;
              this.strucStatus2 = !!res.data.staffing.enclosures.length;
            } else {
              this.configurationImg = [{ enclosureUrl: "" }];
              this.strucStatus2 = false;
            }
            if (res.data.managementMeasures !== null) {
              this.fileList = res.data.managementMeasures.enclosures; // 3管理措施
              this.pkID3 = res.data.managementMeasures.pkId;
              // pdf获取总页数

              if (this.fileList.length == 1) {
                const str = this.fileList[0].enclosureUrl.substring(this.fileList[0].enclosureUrl.lastIndexOf(".") + 1);
                if (str == "pdf") {
                  this.nowPreviewObj = pdf.createLoadingTask(this.fileList[0].enclosureUrl);
                  this.nowPreviewObj.promise
                    .then(pdf => {
                      this.numPages = pdf.numPages;
                    })
                    .catch(err => {
                      console.log("pdf加载失败", err);
                    });
                }
              }
            } else {
              this.fileList = [];
            }
            if (res.data.managementSystem !== null) {
              this.fileList2 = res.data.managementSystem.enclosures; // 4管理制度
              this.pkID4 = res.data.managementSystem.pkId;
              // pdf获取总页数
              if (this.fileList2.length == 1) {
                const str = this.fileList2[0].enclosureUrl.substring(this.fileList2[0].enclosureUrl.lastIndexOf(".") + 1);
                if (str == "pdf") {
                  this.nowPreviewObj2 = pdf.createLoadingTask(this.fileList2[0].enclosureUrl);
                  this.nowPreviewObj2.promise
                    .then(pdf => {
                      this.numPages2 = pdf.numPages;
                    })
                    .catch(err => {
                      console.log("pdf加载失败", err);
                    });
                }
              }
            } else {
              this.fileList2 = [];
            }

            if (res.data.managementSystemDiagram !== null) {
              this.systemImg = res.data.managementSystemDiagram.enclosures.length ? res.data.managementSystemDiagram.enclosures : [{ enclosureUrl: "" }]; // 5管理体系图，只有一张
              this.pkID5 = res.data.managementSystemDiagram.pkId;
              this.strucStatus5 = !!res.data.managementSystemDiagram.enclosures.length;
            } else {
              this.systemImg = [{ enclosureUrl: "" }];
              this.strucStatus5 = false;
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    // 新增上传的文件给后端
    addSystemData(arr) {
      const data = {
        basicsType: this.usable,
        hierarchyType: this.hierarchyType, // 1质量体系 2 安全体系
        enclosures: arr
      };
      if (this.usable == 1) {
        data.pkId = this.pkID1;
      } else if (this.usable == 2) {
        data.pkId = this.pkID2;
      } else if (this.usable == 3) {
        data.pkId = this.pkID3;
      } else if (this.usable == 4) {
        data.pkId = this.pkID4;
      } else if (this.usable == 5) {
        data.pkId = this.pkID5;
      }
      console.log(data);
      this.$api
        .editSystemData(data)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("上传成功");
            this.querySystem();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 删除文件要传pkID
    deleteSystemData(id, index) {
      this.$confirm("确定删除该信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const data = {
          basicsType: this.usable,
          hierarchyType: this.hierarchyType, // 1质量体系 2 安全体系
          enclosures: [],
          pkId: id
        };
        // 处理多个文件的时候
        let url=''
        if(this.usable == 1){
          url=this.structureImgarr[0].enclosureUrl
        }else if(this.usable == 2){
          url=this.configurationImg[0].enclosureUrl
        }else if(this.usable == 5){
          url=this.systemImg[0].enclosureUrl
        }
        if ((index == 0 || index > 0) && this.usable == 4) {
          url=this.fileList2[index].enclosureUrl
          this.fileList2.splice(index, 1);
          data.enclosures = this.fileList2;
        }
        if ((index == 0 || index > 0) && this.usable == 3) {
          url=this.fileList[index].enclosureUrl
          this.fileList.splice(index, 1);
          data.enclosures = this.fileList;
        }

        this.$api
          .editSystemData(data)
          .then(res => {
            if (res.code == 200) {
              this.delFiles(url)
              this.$message.success("删除成功");
              this.querySystem();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    // tab点击切换
    handleClick(tab) {
      // console.log(this.$refs.object);
      // this.$refs.object.preventDefault();
    },
    // 125上传之前回调
    beforeAvatarUpload(data) {
      this.loading = true;
      console.log("beforeAvatarUpload", data);
      const size = 5 * 1024 * 1024;
      if (data.size > size) {
        this.loading = false;
        this.$refs.files.value = "";
        this.$message.warning("文件大小最大为5M");
        return false
      }
      let arr =['image/jpg','image/jpeg','image/png']
      if(!arr.includes(data.type)){
        this.loading = false;
        this.$message.warning("文件格式仅限于.jpg,.png,.jpeg后缀的文件")
        return false
      }
      this.fileName = data.name;
    },
    // 125管理结构上传成功回调
    handleAvatarSuccess(data) {
      if (data.code == 200) {
        console.log("上传成功", data);
        const arr = [{ enclosureName: this.fileName, enclosureUrl: data.data }];
        this.addSystemData(arr);
        // if (this.usable == 1) {
        //   this.structureImg = data.data;
        // }
        // if (this.usable == 2) {
        //   this.configurationImg = data.data;
        // }
        // if (this.usable == 5) {
        //   this.systemImg = data.data;
        // }
      }
    },

    // 预览
    preview(row) {
      const str = row.enclosureUrl.substring(row.enclosureUrl.lastIndexOf(".") + 1);
      // 判断文件类型
      if (!this.fileType.includes(str)) {
        return this.$message("仅支持预览pdf，jpeg，jpg，pdf，docx，xlsx文件");
      }
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.previewType = 2;
        this.url = row.enclosureUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = row;
        console.log(this.nowPreviewObj);
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    },
    // 上传
    uploading() {
      this.$refs.files.click();
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
      const _this = this;
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + "." + name,
          Body: file,
          onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            // const imgIdx = path.lastIndexOf("com/");
            // const imgName = path.substring(imgIdx + 4, path.length);
            // tab是措施还是制度
            if (_this.usable == 3) {
              _this.fileList.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
              _this.addSystemData(_this.fileList);
            } else {
              _this.fileList2.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
              _this.addSystemData(_this.fileList2);
            }

            _this.loading = false;
            // _this.$message({
            //   type: "success",
            //   message: "上传成功"
            // });
            _this.$refs.files.value = "";
          } else {
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
          }
        }
      );
    },
    upLoad() {
      const fileObj = document.getElementById("upload").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      console.log(blobFile);
      const filename = fileObj.name;
      if(fileObj.size<=0){
        return this.$message.warning("文件大小不能为0kb");
      }
      // if (fileObj.size > 5242880) {
      //   this.$refs.file.value = "";
      //   return this.$message.warning("文件大小不能超过5M");
      // }
      const size = 100 * 1024 * 1024;
      if (fileObj.size > size) {
        this.$refs.files.value = "";
        return this.$message.warning("附件大小最大为100M");
      }
      const str = fileObj.name.substring(fileObj.name.lastIndexOf(".") + 1);
      // 判断文件类型
      if (!this.fileType.includes(str)) {
        return this.$message("仅支持上传pdf，jpeg，jpg，pdf，docx，xlsx文件");
      }
      let sign = "";
      let path = "";
      this.loading = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            this.loading = false;
            this.$message({
              type: "error",
              message: res.data.msg
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    // 上传腾讯云
    uploadFile(sign, folder, file, filename) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            // StartTime: 1646818105, // 时间戳，单位秒，如：1580000000
            ExpiredTime: startTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,startTime
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 根据索引删除
    deleteFile(num) {
      console.log(this.fileList2);
    },
    // 截取点后缀
    jiequ(url) {
      return url.substring(url.lastIndexOf(".") + 1);
    },
    delFiles(urls){
      if(urls){
        this.$api.delFiles({urls})
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.form-data {
  display: flex;
  align-items: center;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.the-container {
  /deep/ .el-tabs__item:hover {
    color: #409eff;
    // background-color: orange;
  }
  /deep/ .el-tabs__item.is-active {
    color: #fff;
    background-color: #409eff;
  }
  /deep/ .el-tabs__nav {
    .is-top {
      padding: 0 20px !important;
      // border: 1px solid #000;
    }
  }
  // 去除action下划线
  /deep/ .el-tabs__active-bar {
    height: 0;
  }
  .el-icon-plus {
    font-size: 200px;
  }
  .uploading {
    padding-top: 100px;
    text-align: center;
  }
}
// 图片样式处理
.structure-img {
  // width: fit-content;
  height: 650px;
  overflow: overlay;
  text-align: center;
  position: relative;
  .img-regulate {
    max-width: 100%;
    max-height: 100%;
  }
  .close-img {
    position: absolute;
    // right: -50px;
    top: 0;
    cursor: pointer;
  }
}
.img-status {
  width: 100%;
  height: 100%;
}
// 项目部登录让高度高点
.project-img {
  height: 700px !important;
}
.system {
  display: flex;
  flex-wrap: wrap;

  .file-item {
    cursor: pointer;
    width: 90px;
    height: 90px;
    text-align: center;
    margin: 20px;
    text-align: center;
    position: relative;
    i {
      font-size: 50px;
      color: #f1c84c;
    }
    span {
      display: block;
      width: 80px;
      font-size: 14px;
      overflow: hidden; //超出的文本隐藏
      text-overflow: ellipsis; //溢出用省略号显示
      white-space: nowrap; //溢出不换行
    }
    // 删除文件
    .el-icon-close {
      font-size: 16px;
      position: absolute;
      right: 0;
      top: -20px;
      color: #303030;
    }
  }
  // 上传
  .btn-upload2 {
    width: 90px;
    height: 90px;
    line-height: 90px;
    background-color: #f2f2f2;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    margin: 0 20px;
  }
}
// 预览弹框样式
.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }
  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../assets/loading.gif") no-repeat center center;
  }
  .iframe {
    width: 100%;
    height: 640px;
  }
  .img {
    max-width: 900px;
    // max-height: 610px;
  }
}
// 只有一个文件默认展示预览文件
.preview-file {
  position: relative;
  // width: 100%;
  height: 650px;
  // overflow: auto;
  text-align: center;
  .iframe {
    width: 50%;
    height: 100%;
  }
  img {
    max-width: 100%;
    max-height: 100%;
  }
  .pdf {
    margin: 0 auto;
    width: 50%;
    height: 100%;
    overflow: auto;
  }
  // 上传按钮
  .btn-upload {
    width: 30px;
    height: 30px;
    line-height: 30px;
    background-color: #f2f2f2;
    color: #979797;
    position: absolute;
    right: 10px;
    top: 0;
    font-weight: 600;
    font-size: 20px;
    text-align: center;
    cursor: pointer;
  }
  .btn-upload2 {
    right: 50px !important;
  }
}
</style>
