<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="getOrdersList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表数据区 -->
      <el-table :data="ordersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status == '1'">已付款</el-tag>
            <el-tag type="danger" v-if="scope.row.pay_status == '0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">{{scope.row.create_time | dateFromat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="small" @click="editDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="small" @click="logisticsDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
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
    <!-- 修改对话框 -->
    <el-dialog title="修改地址" :visible.sync="editVisible" width="50%" @close="editClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="88px">
        <el-form-item label="省市区/县" prop="add1">
          <el-cascader
            v-model="editForm.add1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="add2">
          <el-input v-model="editForm.add2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框 -->
    <el-dialog title="物流信息" :visible.sync="logisticsVisible" width="50%">
      <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in logisticsData"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
      <span slot="footer">
        <el-button type="primary" @click="logisticsVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";
export default {
  data() {
    return {
      //查询参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 8,
      },
      total: 0,
      //订单数据
      ordersList: [],
      //物流数据
      logisticsData: [],
      //地址修改表单
      editForm: {
        add1: "",
        add2: "",
      },
      editRules: {
        add1: [{ required: true, message: "请选择省市区/县", trigger: "blur" }],
        add2: [{ required: true, message: "请输入详细地址", trigger: "blur" }],
      },
      //修改对话框显示数据
      editVisible: false,
      //查看物流对话框
      logisticsVisible: false,
      //省市区数据
      cityData: cityData,
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    //获取订单数据
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrdersList();
    },
    //修改对话框显示
    editDialog() {
      this.editVisible = true;
    },
    //修改对话框关闭
    editClose() {
      this.$refs.editFormRef.resetFields();
    },
    //物流信息对话框弹出事件
    async logisticsDialog() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.logisticsData = res.data;
      this.logisticsVisible = true;
    }
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>