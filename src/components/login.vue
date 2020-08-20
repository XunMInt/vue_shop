<template>
  <div class="bg">
    <!-- 登录盒子区域 -->
    <div class="login_box">
      <!-- logo区域 -->
      <div class="logo_box">
        <img src="../assets/images/vue-logo.png" alt />
      </div>
      <!-- 登录输入框 -->
      <el-form ref="loginFromRef" :model="loginForm" :rules="loginFormRules" class="login_form">
          <!-- 账号框 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid" placeholder="请输入用户名"></el-input>
        </el-form-item>
          <!-- 密码框 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock" placeholder="请输入密码"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="buts">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="formReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //用户信息
      loginForm: {
        username: "",
        password: "",
      },
      //表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码长度", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    //重置表单
    formReset() {
      this.$refs.loginFromRef.resetFields();
    },
    //登录事件
    login() {
      //验证表单数据是否符合规则
      this.$refs.loginFromRef.validate(async (val) => {
        if (!val) return;
        //发起登录请求
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status != 200) return this.$Message.error("登录失败");
        this.$Message.success("登录成功");
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.bg {
  width: 100%;
  height: 100%;
  background-color: #2b4b6b;
  .login_box {
    position: absolute;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .logo_box {
      position: absolute;
      left: 50%;
      width: 130px;
      height: 130px;
      padding: 10px;
      border: 1px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      box-sizing: border-box;
      width: 100%;
      padding: 0px 20px;
      bottom: 0;
      .buts {
        float: right;
      }
    }
  }
}
</style>