<template>
    <div>
        <el-button type="info" @click="logout">退出登录</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login');
            this.$Message("你已退出登录");
        }
    },
}
</script>

<style lang="less" scoped>

</style>