<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 数据列表 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :selection-type="false"
        :columns="columns"
        :expand-type="false"
        border
        :show-index="true"
        index-text="#"
        :show-row-hover="false"
      >
        <!-- 状态列 -->
        <template slot="isOk" slot-scope="scope">
          <i
            style="color:#67C23A;font-size:18px"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color:#F56C6C;font-size:18px" class="el-icon-error" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="operation" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="small"
            @click="editCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            @click="delCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="addCateClose">
      <!-- 添加分类表单 -->
      <el-form ref="addCateRef" :model="addCateFrom" :rules="addCateRules" label-width="95px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="cascaderData"
            :options="parentCateList"
            :props="cascaderPros"
            @change="cascaderChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateVisible" width="50%" @close="editCateClose">
      <!-- 添加分类表单 -->
      <el-form ref="editCateRef" :model="editCateFrom" :rules="editCateRules" label-width="95px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateFrom.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 8,
      },
      total: 0,
      //商品分类数据
      cateList: [],
      //父级分类数据
      parentCateList: [],
      //cascader选中值
      cascaderData: [],
      //cascader配置项
      cascaderPros: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      //vue-table插件数据
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "operation",
        },
      ],
      //添加分类表单数据
      addCateFrom: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      editCateFrom: {
        cat_id: 0,
        cat_name: "",
      },
      //添加分类验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //添加分类对话框显示数据
      addCateVisible: false,
      //编辑分类对话框显示数据
      editCateVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //添加分类按钮事件
    addCateDialog() {
      this.addCateVisible = true;
      //获取父级分类列表数据
      this.getParentCateList();
    },
    //获取父级分类列表数据
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.parentCateList = res.data;
    },
    //级联选择器change事件
    cascaderChange() {
      console.log(this.cascaderData);
      if (this.cascaderData.length > 0) {
        this.addCateFrom.cat_pid = this.cascaderData[
          this.cascaderData.length - 1
        ];
        this.addCateFrom.cat_level = this.cascaderData.length;
      } else {
        this.addCateFrom.cat_pid = 0;
        this.addCateFrom.cat_level = 0;
      }
    },
    //监听对话框关闭
    addCateClose() {
      this.$refs.addCateRef.resetFields();
      this.cascaderData = [];
      this.addCateFrom.cat_name = "";
      this.addCateFrom.cat_pid = 0;
      this.addCateFrom.cat_level = 0;
    },
    //添加分类
    addCate() {
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateFrom
        );
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.getCateList();
        this.addCateVisible = false;
      });
    },
    //编辑分类对话框事件
    editCateDialog(data) {
      this.editCateFrom.cat_name = data.cat_name;
      this.editCateFrom.cat_id = data.cat_id;
      this.editCateVisible = true;
    },
    //修改分类
    async modifyCate() {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.editCateFrom.cat_id}`,
          {
            cat_name: this.editCateFrom.cat_name,
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.getCateList();
        this.editCateVisible = false;
      });
    },
    //监听对话框关闭
    editCateClose() {
      this.$refs.editCateRef.resetFields();
      this.editCateFrom.cat_name = "";
      this.editCateFrom.cat_id = 0;
    },
    //删除分类
    delCate(id) {
      this.$confirm("是否删除该分类?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let { data: res } = await this.$http.delete(
            `categories/${id}`
          );
          if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
          this.$Message.success(res.meta.msg);
          this.getCateList();
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>