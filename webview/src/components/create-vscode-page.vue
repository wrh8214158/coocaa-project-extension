<template>
  <div class="wrapper">
    <h2 class="title">{{ $t('Primary.Title') }}</h2>
    <h3 class="title">{{ $t('Primary.FolderName') }}</h3>
    <el-input
      ref="projectNameInputRef"
      class="project-name-input"
      v-model.trim="projectName"
      :placeholder="$t('Primary.FolderNamePlaceHolder')"
      clearable
      autofocus
      @change="projectNameInputChange"
      @input="projectNameInput"
    />
    <h3 class="title">{{ $t('Primary.MetaTitle') }}</h3>
    <el-input
      class="meta-title-input"
      v-model.trim="metaTitle"
      :placeholder="$t('Primary.MetaTitlePlaceHolder')"
      clearable
    />
    <h2 class="title">{{ $t('Secondary.Title') }}</h2>
    <div class="tree-wrapper">
      <el-tree
        ref="elTreeRef"
        :data="dataSource"
        show-checkbox
        node-key="id"
        default-expand-all
        draggable
        :check-on-click-node="false"
        @check-change="checkChange"
        :default-checked-keys="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <div class="file-wrap">
              <el-icon v-if="data.type === 'folder'" class="icon-file-type"><folder /></el-icon>
              <el-icon v-else class="icon-file-type"><document /></el-icon>
              <el-input
                v-if="data.isEdit"
                v-model="data.label"
                ref="elEditInputRef"
                placeholder=""
                clearable
                size="small"
                @blur="elInputBlur(node, data)"
                @change="(val: string) => elInputChange(val, node, data)"
              />
              <span class="label" v-else @click="labelClick(node, data)">
                {{ node.label }}
              </span>
            </div>
            <span class="icon-control-wrapper">
              <el-dropdown
                v-if="data.type === 'folder'"
                @command="(type: 'folder' | 'file') => append(node, data, type)"
                @visible-change="dropdownVisibleChange"
              >
                <span class="el-dropdown-link">
                  <el-icon class="icon-control">
                    <plus />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="folder">文件夹</el-dropdown-item>
                    <el-dropdown-item command="file">文件</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-icon v-if="!data.disabled" @click="remove(node, data)" class="icon-control">
                <minus />
              </el-icon>
            </span>
          </span>
        </template>
      </el-tree>
    </div>
    <h2 class="title">{{ $t('Tertiary.Title') }}</h2>
    <h3 class="title">{{ $t('Tertiary.ReadmeFile') }}</h3>
    <el-input
      v-model="textarea"
      :rows="5"
      :disabled="!readmeInputDisable['readme.md']"
      type="textarea"
      :placeholder="$t('Tertiary.ReadmePlaceHolder')"
      class="textarea"
    />
    <h2 class="title">{{ $t('Fourlevel.Title') }}</h2>
    <div class="btn-wrapper">
      <el-button
        type="primary"
        @click="generateProject"
        :disabled="btnDisabdled || !!!projectName"
        size="large"
      >
        <el-icon><setting /></el-icon>
        <span>{{ $t('Fourlevel.CreateProjectBtnName') }}</span>
      </el-button>
    </div>
  </div>
  <el-backtop />
  <el-switch
    v-model="langage"
    class="langage-switch"
    @change="langageChange"
    active-text="Cn"
    active-value="zh-cn"
    inactive-text="En"
    inactive-value="en"
  />
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted } from 'vue';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { ElTree, ElInput } from 'element-plus';
import { Folder, Document, Plus, Minus, Setting } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

interface Tree {
  id: number;
  label: string;
  type: string;
  checked: boolean;
  canEdit: boolean;
  disabled: boolean;
  isEdit: boolean;
  parent?: string;
  children?: Tree[];
}

const projectName = ref('');

const metaTitle = ref('');

const elTreeRef = ref<InstanceType<typeof ElTree>>();

const elEditInputRef = ref<InstanceType<typeof ElInput>>();

const projectNameInputRef = ref<InstanceType<typeof ElInput>>();

let id = 1000;

const dataSource = ref<Tree[]>([
  {
    id: 1,
    label: 'components',
    type: 'folder',
    checked: true,
    canEdit: true,
    disabled: false,
    isEdit: false,
    children: [
      {
        id: 10,
        label: 'index.ts',
        type: 'file',
        checked: true,
        canEdit: true,
        disabled: false,
        isEdit: false,
        parent: 'components',
        children: []
      }
    ]
  },
  {
    id: 2,
    label: 'images',
    type: 'folder',
    checked: true,
    canEdit: true,
    disabled: false,
    isEdit: false,
    children: []
  },
  {
    id: 3,
    label: 'services',
    type: 'folder',
    checked: true,
    canEdit: true,
    disabled: false,
    isEdit: false,
    children: [
      {
        id: 11,
        label: 'index.ts',
        type: 'file',
        checked: true,
        canEdit: true,
        disabled: false,
        isEdit: false,
        parent: 'services',
        children: []
      }
    ]
  },
  {
    id: 4,
    label: '.ts',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: true,
    isEdit: false
  },
  {
    id: 5,
    label: '.scss',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: false,
    isEdit: false
  },
  {
    id: 6,
    label: '.vue',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: true,
    isEdit: false
  },
  {
    id: 7,
    label: 'index.js',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: true,
    isEdit: false
  },
  {
    id: 8,
    label: 'manifest.json',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: true,
    isEdit: false
  },
  {
    id: 9,
    label: 'readme.md',
    type: 'file',
    checked: true,
    canEdit: false,
    disabled: true,
    isEdit: false
  }
]);

let btnDisabdled = ref(false);

let langage = ref((window as any)?.vscodeLangage || 'zh-cn');

onMounted(() => {
  projectNameInputRef.value?.focus();
});

// 添加
const append = (node: Node, data: Tree, type: 'folder' | 'file') => {
  const newChild = {
    id: id++,
    label: '',
    type,
    checked: true,
    canEdit: true,
    disabled: false,
    isEdit: true,
    parent: node.data.label,
    children: []
  };
  if (!data.children) {
    data.children = [];
  }
  data.children.push(newChild);
  dataSource.value = [...dataSource.value];
  elTreeRef.value!.setCheckedNodes([newChild as any], false);
};

// 移除
const remove = (node: Node, data: Tree) => {
  const parent = node.parent;
  const children: Tree[] = parent.data.children || parent.data;
  const index = children.findIndex((d) => d.id === data.id);
  children.splice(index, 1);
  dataSource.value = [...dataSource.value];
};

// 下拉框消失自动落焦输入框
const dropdownVisibleChange = (flag: boolean) => {
  if (!flag && elEditInputRef.value) {
    nextTick(() => {
      elEditInputRef.value!.focus();
    });
  }
};

// 文件或文件夹输入框变化时触发
const projectNameInputChange = () => {
  projectNameInputRef.value?.blur();
};

// 同步项目名到文件
const projectNameInput = (val: string | number) => {
  const editArr = [
    { id: 4, suffix: '.ts' },
    { id: 5, suffix: '.scss' },
    { id: 6, suffix: '.vue' }
  ];
  editArr.forEach((item) => {
    const currValue = dataSource.value.find((jtem) => jtem.id === item.id);
    if (currValue) {
      currValue.label = val + item.suffix;
    }
  });
};

const checkChange = (data: Tree, checked: boolean) => (data.checked = checked);

// 设置选项三中的 readme.md 输入框是否可输入（此处暂时没用，因为 readme.md 文件不可选）
const readmeInputDisable = computed<any>(() => {
  return dataSource.value.reduce((prev: any, next) => {
    prev[next.label] = next.checked;
    return prev;
  }, {});
});

const elInputBlur = (node: Node, data: Tree) => {
  data.isEdit = !data.isEdit;
  const hasSameName = node.parent.childNodes.some(
    (item) =>
      item.data.label === data.label && item.data.type === data.type && item.data.id !== data.id
  );
  if (!data.label || hasSameName) {
    elTreeRef.value!.remove(node);
  }
};

const elInputChange = (val: string | number, node: Node, data: Tree) =>
  elEditInputRef.value?.blur();

const labelClick = (node: Node, data: Tree) => {
  if (data.canEdit) {
    data.isEdit = !data.isEdit;
    nextTick(() => {
      elEditInputRef.value!.focus();
    });
  }
};

const textarea = ref(`接口文档: \n需求文档: \n高保文档: \n埋点文档: \n`);

// 生成项目
const generateProject = () => {
  btnDisabdled.value = true;
  const params = {
    projectName: projectName.value,
    metaTitle: metaTitle.value,
    treeData: elTreeRef.value!.getCheckedNodes(false, false),
    textarea: textarea.value
  };
  (window as any)?.vscode?.postMessage({
    method: 'createProject',
    params: JSON.stringify(params)
  });
  return params;
};

// 切换全局中英文
const { locale } = useI18n();
const langageChange = (val: string | number | boolean) => {
  locale.value = val === 'zh-cn' ? 'zh-cn' : 'en';
};
</script>

<style scoped lang="scss">
.wrapper {
  width: 50%;
  min-width: 400px;
  margin: 0 auto;
  .title {
    text-align: left;
  }
  .tree-wrapper {
    ::v-deep(.el-tree) {
      background-color: inherit;
      border: 1px solid #dcdfe6;
      border-radius: 5px;
      color: inherit;
      font-weight: bold;
      .el-dropdown {
        color: inherit;
      }
      .el-tree-node__content:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
  }
  .project-name-input,
  .meta-title-input {
    ::v-deep(input) {
      background-color: inherit;
      color: inherit;
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    .file-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      .icon-file-type {
        margin-right: 5px;
      }
    }
    .icon-control-wrapper {
      .icon-control {
        &:nth-child(even) {
          margin-left: 10px;
        }
      }
    }
  }
  .textarea {
    ::v-deep(textarea) {
      background-color: inherit;
      color: inherit;
    }
  }
  .btn-wrapper {
    text-align: center;
    ::v-deep(.el-button) {
      color: inherit;
      font-weight: bold;
    }
  }
}
.langage-switch {
  position: absolute;
  top: 40px;
  right: 40px;
  ::v-deep(.el-switch__label) {
    font-weight: bold;
    span[aria-hidden='false'] {
      color: #14f497;
    }
    span[aria-hidden='true'] {
      color: #409eff;
    }
  }
}
</style>
