using System.Diagnostics;
using System.Linq;

[Microsoft.VisualBasic.CompilerServices.DesignerGenerated()]
internal partial class frmH0607001
{
    #region Windows Form Designer generated code 
    [DebuggerNonUserCode()]
    public frmH0607001() : base()
    {
        // This call is required by the Windows Form Designer.
        InitializeComponent();
    }
    // Form overrides dispose to clean up the component list.
    [DebuggerNonUserCode()]
    protected override void Dispose(bool Disposing)
    {
        if (Disposing)
        {
            if (components is not null)
            {
                components.Dispose();
            }
        }
        base.Dispose(Disposing);
    }
    // Required by the Windows Form Designer
    private System.ComponentModel.IContainer components;
    public Global.System.Windows.Forms.ToolTip ToolTip1;
    public Global.System.Windows.Forms.Timer trmYoukyuTuchi;
    public UI.TimeFlies TimeFlies1;
    public C1.Win.C1Input.C1TextBox imTxtTantoNo;
    public Global.System.Windows.Forms.Button cmdKensaku;
    public Global.System.Windows.Forms.Label lblTantoName;
    public Global.System.Windows.Forms.Label Label1;
    public Global.System.Windows.Forms.GroupBox Frame2;
    public Global.System.Windows.Forms.Button cmdShosai;
    public Global.System.Windows.Forms.Button cmdShuryo;
    public Global.System.Windows.Forms.Timer Timer1;
    public Global.System.Windows.Forms.Label lblAutoUp;
    public Global.System.Windows.Forms.Label Label3;
    public Global.System.Windows.Forms.GroupBox Frame1;
    // NOTE: The following procedure is required by the Windows Form Designer
    // It can be modified using the Windows Form Designer.
    // Do not modify it using the code editor.
    [DebuggerStepThrough()]
    private void InitializeComponent()
    {
        components = new System.ComponentModel.Container();
        var resources = new System.ComponentModel.ComponentResourceManager(typeof(frmH0607001));
        ToolTip1 = new System.Windows.Forms.ToolTip(components);
        Frame1 = new System.Windows.Forms.GroupBox();
        sprYoukyuTuchi = new C1.Win.C1FlexGrid.C1FlexGrid();
        TimeFlies1 = new UI.TimeFlies();
        Frame2 = new System.Windows.Forms.GroupBox();
        imTxtTantoNo = new C1.Win.C1Input.C1TextBox();
        cmdKensaku = new System.Windows.Forms.Button();
        lblTantoName = new System.Windows.Forms.Label();
        Label1 = new System.Windows.Forms.Label();
        cmdShosai = new System.Windows.Forms.Button();
        cmdShuryo = new System.Windows.Forms.Button();
        lblAutoUp = new System.Windows.Forms.Label();
        Label3 = new System.Windows.Forms.Label();
        trmYoukyuTuchi = new System.Windows.Forms.Timer(components);
        Timer1 = new System.Windows.Forms.Timer(components);
        Frame1.SuspendLayout();
        ((System.ComponentModel.ISupportInitialize)sprYoukyuTuchi).BeginInit();
        Frame2.SuspendLayout();
        ((System.ComponentModel.ISupportInitialize)imTxtTantoNo).BeginInit();
        this.SuspendLayout();
        // 
        // Frame1
        // 
        Frame1.BackColor = System.Drawing.SystemColors.Control;
        Frame1.Controls.Add(sprYoukyuTuchi);
        Frame1.Controls.Add(TimeFlies1);
        Frame1.Controls.Add(Frame2);
        Frame1.Controls.Add(cmdShosai);
        Frame1.Controls.Add(cmdShuryo);
        Frame1.Controls.Add(lblAutoUp);
        Frame1.Controls.Add(Label3);
        Frame1.Font = new System.Drawing.Font("MS Gothic", 9.75f, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, 128);
        Frame1.ForeColor = System.Drawing.SystemColors.ControlText;
        Frame1.Location = new System.Drawing.Point(1, 1);
        Frame1.Name = "Frame1";
        Frame1.Padding = new System.Windows.Forms.Padding(0);
        Frame1.RightToLeft = System.Windows.Forms.RightToLeft.No;
        Frame1.Size = new System.Drawing.Size(536, 290);
        Frame1.TabIndex = 1;
        Frame1.TabStop = false;
        // 
        // sprYoukyuTuchi
        // 
        sprYoukyuTuchi.AllowEditing = false;
        sprYoukyuTuchi.ColumnInfo = resources.GetString("sprYoukyuTuchi.ColumnInfo");
        sprYoukyuTuchi.Font = new System.Drawing.Font("MS Gothic", 9.0f, System.Drawing.FontStyle.Bold);
        sprYoukyuTuchi.Location = new System.Drawing.Point(8, 88);
        sprYoukyuTuchi.Name = "sprYoukyuTuchi";
        sprYoukyuTuchi.Rows.Count = 2;
        sprYoukyuTuchi.Rows.DefaultSize = 18;
        sprYoukyuTuchi.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
        sprYoukyuTuchi.ScrollOptions = C1.Win.C1FlexGrid.ScrollFlags.AlwaysVisible;
        sprYoukyuTuchi.SelectionMode = C1.Win.C1FlexGrid.SelectionModeEnum.Row;
        sprYoukyuTuchi.Size = new System.Drawing.Size(513, 153);
        sprYoukyuTuchi.TabIndex = 9;
        // 
        // TimeFlies1
        // 
        TimeFlies1.Enabled = false;
        TimeFlies1.Location = new System.Drawing.Point(384, 16);
        TimeFlies1.Name = "TimeFlies1";
        TimeFlies1.Size = new System.Drawing.Size(137, 17);
        TimeFlies1.TabIndex = 7;
        TimeFlies1.TabStop = false;
        // 
        // Frame2
        // 
        Frame2.BackColor = System.Drawing.SystemColors.Control;
        Frame2.Controls.Add(imTxtTantoNo);
        Frame2.Controls.Add(cmdKensaku);
        Frame2.Controls.Add(lblTantoName);
        Frame2.Controls.Add(Label1);
        Frame2.ForeColor = System.Drawing.SystemColors.ControlText;
        Frame2.Location = new System.Drawing.Point(8, 32);
        Frame2.Name = "Frame2";
        Frame2.Padding = new System.Windows.Forms.Padding(0);
        Frame2.RightToLeft = System.Windows.Forms.RightToLeft.No;
        Frame2.Size = new System.Drawing.Size(521, 49);
        Frame2.TabIndex = 4;
        Frame2.TabStop = false;
        Frame2.Text = "????????";
        // 
        // imTxtTantoNo
        // 
        imTxtTantoNo.Location = new System.Drawing.Point(88, 21);
        imTxtTantoNo.Name = "imTxtTantoNo";
        imTxtTantoNo.Size = new System.Drawing.Size(89, 18);
        imTxtTantoNo.TabIndex = 0;
        imTxtTantoNo.Tag = null;
        // 
        // cmdKensaku
        // 
        cmdKensaku.BackColor = System.Drawing.SystemColors.Control;
        cmdKensaku.Cursor = System.Windows.Forms.Cursors.Default;
        cmdKensaku.ForeColor = System.Drawing.SystemColors.ControlText;
        cmdKensaku.Location = new System.Drawing.Point(368, 16);
        cmdKensaku.Name = "cmdKensaku";
        cmdKensaku.RightToLeft = System.Windows.Forms.RightToLeft.No;
        cmdKensaku.Size = new System.Drawing.Size(137, 25);
        cmdKensaku.TabIndex = 5;
        cmdKensaku.TabStop = false;
        cmdKensaku.Text = "????(F5)";
        cmdKensaku.UseVisualStyleBackColor = false;
        // 
        // lblTantoName
        // 
        lblTantoName.BackColor = System.Drawing.SystemColors.Control;
        lblTantoName.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
        lblTantoName.Cursor = System.Windows.Forms.Cursors.Default;
        lblTantoName.ForeColor = System.Drawing.SystemColors.ControlText;
        lblTantoName.Location = new System.Drawing.Point(184, 21);
        lblTantoName.Name = "lblTantoName";
        lblTantoName.RightToLeft = System.Windows.Forms.RightToLeft.No;
        lblTantoName.Size = new System.Drawing.Size(177, 17);
        lblTantoName.TabIndex = 8;
        lblTantoName.UseMnemonic = false;
        // 
        // Label1
        // 
        Label1.AutoSize = true;
        Label1.BackColor = System.Drawing.SystemColors.Control;
        Label1.Cursor = System.Windows.Forms.Cursors.Default;
        Label1.Font = new System.Drawing.Font("MS Gothic", 9.0f, System.Drawing.FontStyle.Bold);
        Label1.ForeColor = System.Drawing.SystemColors.ControlText;
        Label1.Location = new System.Drawing.Point(6, 24);
        Label1.Name = "Label1";
        Label1.RightToLeft = System.Windows.Forms.RightToLeft.No;
        Label1.Size = new System.Drawing.Size(83, 12);
        Label1.TabIndex = 6;
        Label1.Text = "?S????R?[?h";
        // 
        // cmdShosai
        // 
        cmdShosai.BackColor = System.Drawing.SystemColors.Control;
        cmdShosai.Cursor = System.Windows.Forms.Cursors.Default;
        cmdShosai.ForeColor = System.Drawing.SystemColors.ControlText;
        cmdShosai.Location = new System.Drawing.Point(224, 256);
        cmdShosai.Name = "cmdShosai";
        cmdShosai.RightToLeft = System.Windows.Forms.RightToLeft.No;
        cmdShosai.Size = new System.Drawing.Size(137, 25);
        cmdShosai.TabIndex = 3;
        cmdShosai.TabStop = false;
        cmdShosai.Text = "???(F4)";
        cmdShosai.UseVisualStyleBackColor = false;
        // 
        // cmdShuryo
        // 
        cmdShuryo.BackColor = System.Drawing.SystemColors.Control;
        cmdShuryo.CausesValidation = false;
        cmdShuryo.Cursor = System.Windows.Forms.Cursors.Default;
        cmdShuryo.ForeColor = System.Drawing.SystemColors.ControlText;
        cmdShuryo.Location = new System.Drawing.Point(384, 256);
        cmdShuryo.Name = "cmdShuryo";
        cmdShuryo.RightToLeft = System.Windows.Forms.RightToLeft.No;
        cmdShuryo.Size = new System.Drawing.Size(137, 25);
        cmdShuryo.TabIndex = 2;
        cmdShuryo.TabStop = false;
        cmdShuryo.Text = "?I??(ESC or F3)";
        cmdShuryo.UseVisualStyleBackColor = false;
        // 
        // lblAutoUp
        // 
        lblAutoUp.BackColor = System.Drawing.SystemColors.Control;
        lblAutoUp.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
        lblAutoUp.Cursor = System.Windows.Forms.Cursors.Default;
        lblAutoUp.ForeColor = System.Drawing.SystemColors.ControlText;
        lblAutoUp.Location = new System.Drawing.Point(120, 260);
        lblAutoUp.Name = "lblAutoUp";
        lblAutoUp.RightToLeft = System.Windows.Forms.RightToLeft.No;
        lblAutoUp.Size = new System.Drawing.Size(41, 17);
        lblAutoUp.TabIndex = 11;
        // 
        // Label3
        // 
        Label3.BackColor = System.Drawing.SystemColors.Control;
        Label3.Cursor = System.Windows.Forms.Cursors.Default;
        Label3.ForeColor = System.Drawing.SystemColors.ControlText;
        Label3.Location = new System.Drawing.Point(40, 262);
        Label3.Name = "Label3";
        Label3.RightToLeft = System.Windows.Forms.RightToLeft.No;
        Label3.Size = new System.Drawing.Size(73, 17);
        Label3.TabIndex = 10;
        Label3.Text = "?????X?V?F";
        // 
        // trmYoukyuTuchi
        // 
        trmYoukyuTuchi.Enabled = true;
        trmYoukyuTuchi.Interval = 1;
        // 
        // Timer1
        // 
        Timer1.Enabled = true;
        Timer1.Interval = 500;
        // 
        // frmH0607001
        // 
        this.AutoScaleDimensions = new System.Drawing.SizeF(7.0f, 12.0f);
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.BackColor = System.Drawing.SystemColors.Control;
        this.ClientSize = new System.Drawing.Size(538, 293);
        this.Controls.Add(Frame1);
        this.Cursor = System.Windows.Forms.Cursors.Default;
        this.Font = new System.Drawing.Font("MS Gothic", 9.0f, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, 128);
        this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
        this.KeyPreview = true;
        this.Location = new System.Drawing.Point(25, 22);
        this.MaximizeBox = false;
        this.Name = "frmH0607001";
        this.RightToLeft = System.Windows.Forms.RightToLeft.No;
        this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
        this.Text = @"?v???????\?????";
        Frame1.ResumeLayout(false);
        ((System.ComponentModel.ISupportInitialize)sprYoukyuTuchi).EndInit();
        Frame2.ResumeLayout(false);
        Frame2.PerformLayout();
        ((System.ComponentModel.ISupportInitialize)imTxtTantoNo).EndInit();
        this.ResumeLayout(false);

    }

    public C1.Win.C1FlexGrid.C1FlexGrid sprYoukyuTuchi;
    #endregion
}

