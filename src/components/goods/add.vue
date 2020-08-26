<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 警告提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeNum - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧Tabs栏 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromref"
        label-position="top"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-tabs
          v-model="activeNum"
          tab-position="left"
          :before-leave="beforeLeaveTabs"
          @tab-click="tabsClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addFrom.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addFrom.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop>
              <el-cascader
                v-model="addFrom.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in manyTableData"
              :key="index"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, i) in item.attr_vals" :key="i" :label="cb" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="(item, index) in onlyTableData"
              :key="index"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadApi"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addFrom.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBut" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picVisible" width="30%">
      <img :src="picURL" style="width:100%" alt />
      <span slot="footer" class="pic-footer">
        <el-button type="primary" @click="picVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      activeNum: "0",
      //级联选择器配置项
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //分类数据
      cateList: [],
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //图片预览地址
      picURL: "",
      //图片预览显示参数
      picVisible: false,
      //上传文件请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //添加商品表单
      addFrom: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      //添加商品验证规则
      addFromRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //获取三级ID
    cateId() {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[this.addFrom.goods_cat.length - 1];
      } else {
        return null;
      }
    },
    //获取图片上传地址
    uploadApi() {
      return this.$http.defaults.baseURL + "upload";
    },
  },
  methods: {
    async getCateList() {
      let { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateList = res.data;
    },
    //分类选中事件
    handleChange() {
      //判断是否为三级分类
      if (this.addFrom.goods_cat.length !== 3) {
        return (this.addFrom.goods_cat = []);
      }
    },
    //阻止tabs切换
    beforeLeaveTabs(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addFrom.goods_cat.length === 0) {
        this.$Message.error("请先选择分类");
        return false;
      }
    },
    //tabs点击事件
    async tabsClick() {
      //商品参数事件
      if (this.activeNum === "1") {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
        //商品属性事件
      } else if (this.activeNum === "2") {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.onlyTableData = res.data;
        console.log(this.onlyTableData);
      }
    },
    //预览图片事件
    handlePreview(file) {
      this.picURL = file.response.data.url;
      this.picVisible = true;
    },
    //删除图片事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      let index = this.addFrom.pics.findIndex((x) => x.pic === filePath);
      this.addFrom.pics.splice(index, 1);
    },
    //图片上传成功事件
    handleSuccess(res) {
      const picInfo = {
        pic: res.data.tmp_path,
      };
      this.addFrom.pics.push(picInfo);
    },
    //添加商品
    addGoods() {
      //表单预验证
      this.$refs.addFromref.validate(async (val) => {
        if (!val) {
          return this.$Message.error("请填写必要的表单项！");
        }
        const form = _.cloneDeep(this.addFrom);
        form.goods_cat = form.goods_cat.join(",");
        //处理动态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addFrom.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addFrom.attrs.push(newInfo);
        });
        form.attrs = this.addFrom.attrs;
        //向服务器请求添加商品
        let { data: res } = await this.$http.post("goods", form);
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.$router.push("/goods");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 5px !important;
}
.addBut {
  margin-top: 15px;
}
</style>